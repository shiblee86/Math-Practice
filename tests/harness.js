// Minimal, dependency-free test harness for a plain-script (no build step) codebase.
// Loaded as a plain <script> like every other file in this project.
//
// API:
//   suite('name', () => { ... })
//   test('name', () => { ... })            // sync
//   test('name', async () => { ... })      // async (use `await sleep(ms)` for timer-based code)
//   assert.ok(value, msg?)
//   assert.equal(actual, expected, msg?)
//   assert.deepEqual(actual, expected, msg?)
//   assert.throws(fn, msg?)
//   assert.match(str, substringOrRegex, msg?)
//   sleep(ms) -> Promise
//
// After all suite()/test() calls across all loaded *.test.js files, call runTests()
// once. It returns a Promise resolving to the results object and also assigns it to
// window.__TEST_RESULTS__ (read by tests/run.py for headless/CLI runs) and renders a
// human-readable report into #results (for opening tests/index.html in a browser).
(function () {
  const suites = [];
  let currentSuite = null;

  function suite(name, fn) {
    currentSuite = { name, tests: [] };
    suites.push(currentSuite);
    fn();
    currentSuite = null;
  }

  function test(name, fn) {
    if (!currentSuite) throw new Error(`test("${name}") called outside of a suite(...)`);
    currentSuite.tests.push({ name, fn });
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  class AssertionError extends Error {}

  const assert = {
    ok(value, msg) {
      if (!value) throw new AssertionError(msg || `expected truthy value, got ${JSON.stringify(value)}`);
    },
    equal(actual, expected, msg) {
      if (actual !== expected) {
        throw new AssertionError(msg || `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
    },
    deepEqual(actual, expected, msg) {
      const a = JSON.stringify(actual), e = JSON.stringify(expected);
      if (a !== e) throw new AssertionError(msg || `expected ${e}, got ${a}`);
    },
    throws(fn, msg) {
      let threw = false;
      try { fn(); } catch (e) { threw = true; }
      if (!threw) throw new AssertionError(msg || 'expected function to throw, but it did not');
    },
    match(str, pattern, msg) {
      const ok = pattern instanceof RegExp ? pattern.test(str) : String(str).includes(pattern);
      if (!ok) throw new AssertionError(msg || `expected ${JSON.stringify(str)} to match ${pattern}`);
    }
  };

  async function runTests() {
    const report = { suites: [], passed: 0, failed: 0, total: 0 };
    for (const s of suites) {
      const suiteReport = { name: s.name, tests: [] };
      for (const t of s.tests) {
        report.total++;
        try {
          await t.fn();
          suiteReport.tests.push({ name: t.name, status: 'pass' });
          report.passed++;
        } catch (e) {
          suiteReport.tests.push({ name: t.name, status: 'fail', error: (e && e.message) || String(e) });
          report.failed++;
        }
      }
      report.suites.push(suiteReport);
    }
    window.__TEST_RESULTS__ = report;
    renderReport(report);
    return report;
  }

  function renderReport(report) {
    const el = document.getElementById('results');
    if (!el) return;
    const lines = [];
    lines.push(`<h2>${report.failed === 0 ? '✅' : '❌'} ${report.passed}/${report.total} passed</h2>`);
    report.suites.forEach(s => {
      const failCount = s.tests.filter(t => t.status === 'fail').length;
      lines.push(`<h3>${failCount ? '❌' : '✅'} ${s.name}</h3><ul>`);
      s.tests.forEach(t => {
        if (t.status === 'pass') {
          lines.push(`<li style="color:#2FE6A7;">✔ ${t.name}</li>`);
        } else {
          lines.push(`<li style="color:#FF6B6B;">✘ ${t.name} — ${escapeHtml(t.error)}</li>`);
        }
      });
      lines.push('</ul>');
    });
    el.innerHTML = lines.join('\n');
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  window.suite = suite;
  window.test = test;
  window.assert = assert;
  window.sleep = sleep;
  window.runTests = runTests;
})();
