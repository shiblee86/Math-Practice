#!/usr/bin/env python3
"""
CLI test runner for Math Dojo's browser-based test suite (tests/index.html).

This project has no build step and no npm/node dependency, so the test suite
itself is plain browser JS with zero dependencies (see harness.js) — you can
always run it by just opening tests/index.html in any browser.

This script is a convenience for running it from a terminal / CI instead:

    python3 tests/run.py

It spawns its own `python3 -m http.server` (serving the repo root) and its own
headless Chrome (driven via the DevTools Protocol), navigates to
tests/index.html, waits for the suite to finish, prints a pass/fail report,
and exits non-zero if anything failed. Both child processes are torn down on
exit.

Requires: a Chrome/Chromium binary on PATH, and the `websockets` package
(`pip install websockets`) — needed only for this optional CLI wrapper, not
for the test suite itself.
"""
import argparse
import asyncio
import json
import os
import shutil
import socket
import subprocess
import sys
import time
import urllib.request

try:
    import websockets
except ImportError:
    sys.exit(
        "tests/run.py needs the 'websockets' package to talk to Chrome's DevTools "
        "Protocol:\n\n    pip install websockets\n\n"
        "(This is only required for this CLI wrapper — the test suite itself has "
        "zero dependencies and can always be run by opening tests/index.html "
        "directly in any browser.)"
    )

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME_CANDIDATES = ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser", "chrome"]


def find_chrome():
    for name in CHROME_CANDIDATES:
        path = shutil.which(name)
        if path:
            return path
    sys.exit("Could not find a Chrome/Chromium binary on PATH (tried: " + ", ".join(CHROME_CANDIDATES) + ")")


def free_port():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(("127.0.0.1", 0))
    port = s.getsockname()[1]
    s.close()
    return port


def wait_for_http(url, timeout=15):
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            urllib.request.urlopen(url, timeout=1)
            return True
        except Exception:
            time.sleep(0.2)
    return False


def print_report(report):
    for s in report["suites"]:
        fail_count = sum(1 for t in s["tests"] if t["status"] == "fail")
        icon = "❌" if fail_count else "✅"
        print(f"\n{icon} {s['name']}")
        for t in s["tests"]:
            if t["status"] == "pass":
                print(f"   ✔ {t['name']}")
            else:
                print(f"   ✘ {t['name']}\n       {t['error']}")
    print(f"\n{'='*60}")
    status = "PASSED" if report["failed"] == 0 else "FAILED"
    print(f"{status}: {report['passed']}/{report['total']} tests passed")


class CDPClient:
    """Thin CDP wrapper with a background reader — required because the app under
    test calls window.alert() (e.g. markDone's "Activity complete!" confirmation).
    A JS dialog pauses the *entire* tab, including our own Runtime.evaluate calls,
    until something sends Page.handleJavaScriptDialog — so that has to happen
    concurrently with (not after) whatever call is currently in flight."""

    def __init__(self, ws):
        self.ws = ws
        self.next_id = 0
        self.pending = {}
        self.reader_task = None

    async def _reader(self):
        async for raw in self.ws:
            msg = json.loads(raw)
            if "id" in msg and msg["id"] in self.pending:
                self.pending.pop(msg["id"]).set_result(msg)
            elif msg.get("method") == "Page.javascriptDialogOpening":
                asyncio.ensure_future(self.send("Page.handleJavaScriptDialog", {"accept": True}))

    def start(self):
        self.reader_task = asyncio.ensure_future(self._reader())

    async def send(self, method, params=None, timeout=10):
        self.next_id += 1
        mid = self.next_id
        fut = asyncio.get_event_loop().create_future()
        self.pending[mid] = fut
        await self.ws.send(json.dumps({"id": mid, "method": method, "params": params or {}}))
        return await asyncio.wait_for(fut, timeout=timeout)

    async def evaluate(self, expr, timeout=10):
        r = await self.send("Runtime.evaluate",
                             {"expression": expr, "returnByValue": True, "awaitPromise": True}, timeout)
        result = r.get("result", {})
        if "exceptionDetails" in result:
            raise RuntimeError(json.dumps(result["exceptionDetails"]))
        return result.get("result", {}).get("value")


async def run_suite(cdp_port, test_url, timeout):
    new_tab_req = urllib.request.Request(f"http://localhost:{cdp_port}/json/new?{test_url}", method="PUT")
    with urllib.request.urlopen(new_tab_req) as resp:
        tab = json.loads(resp.read())
    tab_id = tab["id"]
    ws_url = tab["webSocketDebuggerUrl"]

    try:
        async with websockets.connect(ws_url, max_size=20 * 1024 * 1024) as ws:
            cdp = CDPClient(ws)
            cdp.start()
            await cdp.send("Page.enable")
            await cdp.send("Runtime.enable")

            deadline = time.time() + timeout
            while time.time() < deadline:
                value = await cdp.evaluate("window.__TEST_RESULTS__ ? JSON.stringify(window.__TEST_RESULTS__) : null")
                if value:
                    return json.loads(value)
                await asyncio.sleep(0.3)
            raise TimeoutError(f"Timed out after {timeout}s waiting for the suite to finish")
    finally:
        try:
            urllib.request.urlopen(f"http://localhost:{cdp_port}/json/close/{tab_id}", timeout=2)
        except Exception:
            pass


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--http-port", type=int, default=None, help="port for the static file server (default: auto)")
    ap.add_argument("--timeout", type=int, default=60, help="seconds to wait for the suite to finish (default: 60)")
    args = ap.parse_args()

    http_port = args.http_port or free_port()
    cdp_port = free_port()
    chrome_bin = find_chrome()

    print(f"Starting static server on :{http_port} (serving {REPO_ROOT}) ...")
    server_proc = subprocess.Popen(
        [sys.executable, "-m", "http.server", str(http_port)],
        cwd=REPO_ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
    )
    chrome_proc = None
    try:
        if not wait_for_http(f"http://localhost:{http_port}/index.html"):
            sys.exit("Static server did not come up in time")

        print(f"Launching headless Chrome on CDP port :{cdp_port} ...")
        chrome_proc = subprocess.Popen(
            [chrome_bin, "--headless=new", "--disable-gpu", "--no-sandbox",
             f"--remote-debugging-port={cdp_port}", "--window-size=430,900", "about:blank"],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
        )
        if not wait_for_http(f"http://localhost:{cdp_port}/json/version"):
            sys.exit("Chrome DevTools endpoint did not come up in time")

        test_url = f"http://localhost:{http_port}/tests/index.html"
        print("Running suite (unit + integration + regression)...")
        report = asyncio.run(run_suite(cdp_port, test_url, args.timeout))

        print_report(report)
        sys.exit(0 if report["failed"] == 0 else 1)
    finally:
        if chrome_proc:
            chrome_proc.terminate()
            try:
                chrome_proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                chrome_proc.kill()
        server_proc.terminate()
        try:
            server_proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            server_proc.kill()


if __name__ == "__main__":
    main()
