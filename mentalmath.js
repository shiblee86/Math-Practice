// mentalmath.js — Mental Math Gym content & logic.
// Classic script (no ES modules): loaded with <script src="mentalmath.js"></script>
// after mathdata.js. Everything below is global, matching the mathdata.js pattern.
const FACT_SETS = [
  { id: 'add20',   icon: '➕',  label: 'Add to 20',     desc: 'Sums up to 20' },
  { id: 'sub20',   icon: '➖',  label: 'Take away',     desc: 'Differences to 20' },
  { id: 'bridge',  icon: '🌉',  label: 'Bridging ten',  desc: '12−5, 17−8, 8+5' },
  { id: 'doubles', icon: '👟',  label: 'Doubles',       desc: '7+7, 7+8' },
  { id: 'makeTen', icon: '🎯',  label: 'Make ten',      desc: '7+?=10' },
  { id: 'nine',    icon: '⚡',  label: 'Nines',         desc: '+9 and −9' },
  { id: 'missing', icon: '❓',  label: 'Missing number', desc: '17−?=10' },
  { id: 'tables',  icon: '✖️', label: 'Times tables',  desc: '2s to 10s' },
  { id: 'sameTens', icon: '🔟', label: 'Same tens',    desc: '17−12, 26−23' },
];

const SET_LABEL = FACT_SETS.reduce((m, s) => (m[s.id] = s.label, m), {});
const ALL_SET_IDS = FACT_SETS.map(s => s.id);

const r = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
const mmPick = a => a[Math.floor(Math.random() * a.length)]; // named mmPick: mathdata.js already declares a top-level pick()
const MINUS = '−';

function fact(set, display, answer, extra) {
  return Object.assign({ set, display, answer, id: set + ':' + display }, extra || {});
}

// ── generators ───────────────────────────────────────────────
const GEN = {
  add20() {
    const a = r(2, 14), b = r(2, Math.min(9, 20 - a));
    return fact('add20', `${a} + ${b}`, a + b, { a, b, op: '+' });
  },
  sub20() {
    const a = r(6, 20), b = r(2, Math.min(9, a - 1));
    return fact('sub20', `${a} ${MINUS} ${b}`, a - b, { a, b, op: '-' });
  },
  bridge() {
    if (Math.random() < 0.6) {                       // 12 − 5
      const a = r(11, 18), b = r(a - 9, 9);          // forces crossing ten
      return fact('bridge', `${a} ${MINUS} ${b}`, a - b, { a, b, op: '-', bridging: true });
    }
    const a = r(6, 9), b = r(11 - a, 9);             // 8 + 5
    return fact('bridge', `${a} + ${b}`, a + b, { a, b, op: '+', bridging: true });
  },
  doubles() {
    const n = r(3, 9);
    const flavor = mmPick(['double', 'near', 'nearDown']);
    if (flavor === 'double') return fact('doubles', `${n} + ${n}`, n + n, { a: n, b: n, op: '+' });
    if (flavor === 'near')   return fact('doubles', `${n} + ${n + 1}`, n + n + 1, { a: n, b: n + 1, op: '+' });
    return fact('doubles', `${n + 1} + ${n}`, n + n + 1, { a: n + 1, b: n, op: '+' });
  },
  makeTen() {
    const a = r(1, 9);
    return fact('makeTen', `${a} + ? = 10`, 10 - a, { a, b: 10 - a, op: '+', missing: 'b', total: 10 });
  },
  nine() {
    if (Math.random() < 0.5) {
      const a = r(2, 9);
      return fact('nine', `${a} + 9`, a + 9, { a, b: 9, op: '+' });
    }
    const a = r(11, 18);
    return fact('nine', `${a} ${MINUS} 9`, a - 9, { a, b: 9, op: '-' });
  },
  // 17 − ? = 10 · ? − 5 = 3 · 10 + ? = 17 · ? + 5 = 9
  missing() {
    const flavor = mmPick(['subB', 'subA', 'addB', 'addA']);
    if (flavor === 'subB') { const a = r(11, 20), c = r(2, a - 2); return fact('missing', `${a} ${MINUS} ? = ${c}`, a - c, { a, c, op: '-', missing: 'b' }); }
    if (flavor === 'subA') { const b = r(2, 9), c = r(2, 11);      return fact('missing', `? ${MINUS} ${b} = ${c}`, b + c, { b, c, op: '-', missing: 'a' }); }
    if (flavor === 'addB') { const a = r(2, 14), c = a + r(2, Math.min(9, 20 - a)); return fact('missing', `${a} + ? = ${c}`, c - a, { a, c, op: '+', missing: 'b' }); }
    const b = r(2, 9), c = b + r(1, 9);
    return fact('missing', `? + ${b} = ${c}`, c - b, { b, c, op: '+', missing: 'a' });
  },
  tables() {
    const a = r(2, 10), b = r(2, 10);
    return fact('tables', `${a} × ${b}`, a * b, { a, b, op: '×' });
  },
  // Tens match, so only the ones need subtracting: 17 − 12.
  sameTens() {
    const t = r(1, 4), a1 = r(3, 9), b1 = r(1, a1 - 1);
    const a = t * 10 + a1, b = t * 10 + b1;
    return fact('sameTens', `${a} ${MINUS} ${b}`, a - b, { a, b, op: '-', sameTens: true });
  },
};

function randFact(setId) { return (GEN[setId] || GEN.add20)(); }

// Weighted draw: missed facts' sets come up more often.
function buildDrill(count, sets, misses) {
  sets = (sets && sets.length) ? sets : ALL_SET_IDS;
  const missBySet = {};
  Object.keys(misses || {}).forEach(id => {
    const set = id.split(':')[0];
    missBySet[set] = (missBySet[set] || 0) + misses[id];
  });
  const bag = [];
  sets.forEach(s => { const w = 1 + Math.min(3, missBySet[s] || 0); for (let i = 0; i < w; i++) bag.push(s); });
  const out = []; const seen = new Set();
  let guard = 0;
  while (out.length < count && guard++ < count * 40) {
    const f = randFact(mmPick(bag));
    if (seen.has(f.id) && out.length < Math.min(count, 24)) continue;
    seen.add(f.id); out.push(f);
  }
  return out;
}

// Multiple-choice distractors: plausible near-misses, not random noise.
function choicesFor(f) {
  const set = new Set([f.answer]);
  const cands = [f.answer + 1, f.answer - 1, f.answer + 10, f.answer - 10, f.answer + 2, f.answer - 2];
  cands.forEach(v => { if (v >= 0 && set.size < 4) set.add(v); });
  return [...set].sort(() => Math.random() - 0.5).map(v => ({ label: String(v), correct: v === f.answer }));
}

// ── strategy coaching ────────────────────────────────────────
function strategyFor(f) {
  const { a, b, c, op, answer } = f;
  if (f.set === 'nine' && op === '+') return { name: 'Add ten, take one', line: `${a} + 10 = ${a + 10}, then ${MINUS}1 → ${answer}` };
  if (f.set === 'nine' && op === '-') return { name: 'Take ten, add one', line: `${a} ${MINUS} 10 = ${a - 10}, then +1 → ${answer}` };
  if (f.set === 'makeTen') return { name: 'Make ten', line: `${a} needs ${answer} more to fill the ten.` };
  if (f.set === 'doubles') {
    if (a === b) return { name: 'Double', line: `Double ${a} → ${answer}` };
    const n = Math.min(a, b);
    return { name: 'Near double', line: `Double ${n} is ${n * 2}, then one more → ${answer}` };
  }
  if (f.set === 'tables') return { name: 'Skip count', line: `${b} groups of ${a} → ${answer}` };
  if (f.missing === 'b' && op === '-') return { name: 'Count back', line: `From ${a} back to ${c} is ${answer} steps.` };
  if (f.missing === 'a' && op === '-') return { name: 'Add it back', line: `${c} + ${b} = ${answer}` };
  if (f.missing === 'b' && op === '+') return { name: 'Count on', line: `From ${a} up to ${c} is ${answer}.` };
  if (f.missing === 'a' && op === '+') return { name: 'Take it off', line: `${c} ${MINUS} ${b} = ${answer}` };
  if (f.sameTens || (op === '-' && a >= 10 && b >= 10 && Math.floor(a / 10) === Math.floor(b / 10))) {
    const t = Math.floor(a / 10);
    return { name: 'Same tens', line: `${a} and ${b} both have ${t} ten${t === 1 ? '' : 's'}. The tens are the same, so only take the ones away: ${a % 10} ${MINUS} ${b % 10} = ${answer}` };
  }
  if (op === '-' && a - b >= 1 && a - b <= 6) {
    return { name: 'Count up', line: `Start at ${b} and hop up to ${a}: ${hopList(b, a)}. That is ${jumps(answer)}.` };
  }
  if (op === '+' && Math.max(a, b) >= 10) {
    const big = Math.max(a, b), small = Math.min(a, b);
    return { name: 'Count on', line: `Start at ${big} and count on ${small} more: ${countList(big + 1, answer)}. You land on ${answer}.` };
  }
  if (op === '-' && a > 10 && b > a - 10) { const p = a - 10, rest = b - p; return { name: 'Bridge ten', line: `${a} ${MINUS} ${p} = 10, then 10 ${MINUS} ${rest} → ${answer}` }; }
  if (op === '+' && a + b > 10 && a < 10) { const p = 10 - a, rest = b - p; return { name: 'Bridge ten', line: `${a} + ${p} = 10, then 10 + ${rest} → ${answer}` }; }
  if (op === '-') return { name: 'Count back', line: `Start at ${a}, count back ${b} → ${answer}` };
  return { name: 'Count on', line: `Start at ${a}, count on ${b} → ${answer}` };
}

function countList(from, to) {
  const out = [];
  for (let i = from; i <= to && out.length < 12; i++) out.push(i);
  return out.join(', ');
}
function hopList(from, to) {
  const out = [];
  for (let i = from; i < to && out.length < 10; i++) out.push(`${i} → ${i + 1}`);
  return out.join(', ');
}
function jumps(n) { return n === 1 ? '1 hop' : `${n} hops`; }

// A trainer fact is one that has a clean 3-step scaffold.
function trainerFact() {
  const kind = mmPick(['subBridge', 'addBridge', 'missing', 'sameTens', 'countUp', 'countOn']);
  if (kind === 'sameTens') return GEN.sameTens();
  if (kind === 'countUp') { const a = r(11, 15), b = a - r(2, 5); return fact('sub20', `${a} ${MINUS} ${b}`, a - b, { a, b, op: '-', countUp: true }); }  if (kind === 'countOn') { const a = r(10, 14), b = r(4, 8); return fact('add20', `${a} + ${b}`, a + b, { a, b, op: '+', countOn: true }); }
  if (kind === 'subBridge') { const a = r(11, 18), b = r(a - 9, 9); return fact('bridge', `${a} ${MINUS} ${b}`, a - b, { a, b, op: '-', bridging: true }); }
  if (kind === 'addBridge') { const a = r(6, 9), b = r(11 - a, 9); return fact('bridge', `${a} + ${b}`, a + b, { a, b, op: '+', bridging: true }); }
  const mflavor = mmPick(['subB', 'addB', 'subA']);
  if (mflavor === 'subB') { const a = r(12, 18), c = r(2, 9); return fact('missing', `${a} ${MINUS} ? = ${c}`, a - c, { a, c, op: '-', missing: 'b' }); }
  if (mflavor === 'addB') { const a = r(6, 9), c = r(12, 17); return fact('missing', `${a} + ? = ${c}`, c - a, { a, c, op: '+', missing: 'b' }); }
  const mb = r(2, 9), mc = r(2, 9);
  return fact('missing', `? ${MINUS} ${mb} = ${mc}`, mb + mc, { b: mb, c: mc, op: '-', missing: 'a' });
}

// steps: [{ text, answer }] — the child fills each blank in turn.
function trainerSteps(f) {
  const { a, b, c, op, answer } = f;
  if (f.sameTens) {
    const t = Math.floor(a / 10);
    return [
      { text: `${a} and ${b} both have ${t} ten${t === 1 ? '' : 's'}. The tens are the same, so leave them. Now take the ones: ${a % 10} ${MINUS} ${b % 10} is`, answer },
    ];
  }
  if (f.countUp) return [
    { text: `We start at ${b}. What number comes next?`, answer: b + 1 },
    { text: `Now hop up to ${a}: ${hopList(b, a)}. How many hops was that?`, answer },
  ];
  if (f.countOn) return [
    { text: `Start at the bigger number, ${a}. What comes next?`, answer: a + 1 },
    { text: `Count on ${b} more: ${countList(a + 1, answer)}. What number do you land on?`, answer },
  ];
  if (f.set === 'bridge' && op === '-') {
    const p = a - 10, rest = b - p;
    return [
      { text: `Split the ${b} into ${p} and`, answer: rest },
      { text: `${a} ${MINUS} ${p} lands on`, answer: 10 },
      { text: `10 ${MINUS} ${rest} is`, answer },
    ];
  }
  if (f.set === 'bridge' && op === '+') {
    const p = 10 - a, rest = b - p;
    return [
      { text: `${a} needs how many to make ten?`, answer: p },
      { text: `Split the ${b} into ${p} and`, answer: rest },
      { text: `10 + ${rest} is`, answer },
    ];
  }
  if (f.missing === 'b' && op === '-') {
    if (c < 10 && a > 10) return [
      { text: `Count up from ${c} to ten. How many?`, answer: 10 - c },
      { text: `Now from ten up to ${a}. How many?`, answer: a - 10 },
      { text: `${10 - c} and ${a - 10} together make`, answer },
    ];
    return [{ text: `Count back from ${a} to ${c}. How many steps?`, answer }];
  }
  if (f.missing === 'a' && op === '-') return [
    { text: `We took ${b} away and ${c} was left. Put the ${b} back:`, answer },
  ];
  if (f.missing === 'b' && op === '+') return [
    { text: `${a} needs how many to reach ten?`, answer: Math.max(0, 10 - a) },
    { text: `So ${a} + ? = ${c} means ?  is`, answer },
  ];
  return [{ text: `${c} ${MINUS} ${b} is`, answer }];
}

// ── spaced repetition (Leitner boxes) ────────────────────────
const BOX_GAPS = [0, 1, 2, 4, 8];  // sessions to wait per box

function gradeCard(cards, id, easy, session) {
  const next = Object.assign({}, cards);
  const cur = next[id] || { box: 0, seen: 0 };
  const box = easy ? Math.min(BOX_GAPS.length - 1, cur.box + 1) : 0;
  next[id] = { box, seen: cur.seen + 1, due: session + BOX_GAPS[box] };
  return next;
}

function dueCards(cards, session) {
  return Object.keys(cards).filter(id => (cards[id].due || 0) <= session);
}

function flashDeck(cards, session, sets, count) {
  const due = dueCards(cards, session);
  const deck = [];
  due.slice(0, count).forEach(id => {
    const [set, display] = [id.split(':')[0], id.slice(id.indexOf(':') + 1)];
    deck.push({ set, display, id, answer: null, revived: true });
  });
  while (deck.length < count) {
    const f = randFact(mmPick(sets && sets.length ? sets : ALL_SET_IDS));
    if (!deck.some(d => d.id === f.id)) deck.push(f);
  }
  // revived cards have no stored answer — regenerate a fresh fact for those slots
  return deck.map(d => (d.answer === null ? randFact(d.set) : d));
}

function mastery(cards) {
  const ids = Object.keys(cards);
  if (!ids.length) return 0;
  const strong = ids.filter(id => cards[id].box >= 3).length;
  return Math.round(strong / ids.length * 100);
}

function weakFacts(misses, limit) {
  return Object.keys(misses || {})
    .sort((x, y) => misses[y] - misses[x])
    .slice(0, limit || 6)
    .map(id => ({ id, display: id.slice(id.indexOf(':') + 1), set: id.split(':')[0], count: misses[id] }));
}

// ── daily sheets ─────────────────────────────────────────────
// Seeded so the same date always produces the same sheet.
function seedFrom(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; }
  return h >>> 0;
}
function seeded(seed) {
  let t = seed;
  return () => { t += 0x6D2B79F5; let x = Math.imul(t ^ t >>> 15, 1 | t); x ^= x + Math.imul(x ^ x >>> 7, 61 | x); return ((x ^ x >>> 14) >>> 0) / 4294967296; };
}

function todayKey() { return new Date().toDateString(); }

const MARKET = [
  { name: 'eggs', emoji: '🥚' }, { name: 'beans', emoji: '🫘' }, { name: 'bananas', emoji: '🍌' },
  { name: 'bread', emoji: '🍞' }, { name: 'milk', emoji: '🥛' }, { name: 'apples', emoji: '🍎' },
  { name: 'cheese', emoji: '🧀' }, { name: 'rice', emoji: '🍚' }, { name: 'juice', emoji: '🧃' },
  { name: 'carrots', emoji: '🥕' }, { name: 'honey', emoji: '🍯' }, { name: 'noodles', emoji: '🍜' },
];

function listNames(items) {
  const n = items.map(i => i.name);
  return n.length === 1 ? n[0] : n.slice(0, -1).join(', ') + ' and ' + n[n.length - 1];
}

// 16 problems: 4 add, 4 subtract, 4 shopping-total, 4 change-back.
function dailySheet(key) {
  const rnd = seeded(seedFrom('daily' + key));
  const R = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));
  const shelf = MARKET.slice().sort(() => rnd() - 0.5);
  let shelfAt = 0;
  const take = n => { const out = shelf.slice(shelfAt, shelfAt + n); shelfAt = (shelfAt + n) % (shelf.length - 3); return out; };
  const out = [];

  for (let i = 0; i < 4; i++) {
    const a = R(3, 14), b = R(2, Math.min(9, 20 - a));
    out.push({ id: `d-add-${i}`, group: 'Adding', kind: 'plain', op: '+', a, b, display: `${a} + ${b}`, answer: a + b });
  }
  for (let i = 0; i < 4; i++) {
    const a = R(9, 20), b = R(2, Math.min(9, a - 1));
    out.push({ id: `d-sub-${i}`, group: 'Taking away', kind: 'plain', op: '-', a, b, display: `${a} ${MINUS} ${b}`, answer: a - b });
  }
  for (let i = 0; i < 4; i++) {
    const n = R(2, 3);
    let items = take(n).map(it => ({ ...it, price: R(2, 7) }));
    const total = items.reduce((s, it) => s + it.price, 0);
    out.push({
      id: `d-wadd-${i}`, group: 'At the market', kind: 'word', op: '+', items,
      text: `You go to the market and buy ${listNames(items)}. How much do you owe the shopkeeper?`,
      answer: total, a: total, b: 0,
    });
  }
  for (let i = 0; i < 4; i++) {
    const n = R(1, 2);
    let items = take(n).map(it => ({ ...it, price: R(3, 8) }));
    const total = items.reduce((s, it) => s + it.price, 0);
    const note = total <= 10 ? 10 : 20;
    out.push({
      id: `d-wsub-${i}`, group: 'Change back', kind: 'word', op: '-', items, note, total,
      text: `You buy ${listNames(items)} and hand over a $${note} note. How much change do you get back?`,
      answer: note - total, a: note, b: total,
    });
  }
  return out;
}

function dailyHint(p) {
  if (p.kind === 'word' && p.op === '+') return `Add the prices one at a time: ${p.items.map(i => '$' + i.price).join(' + ')}`;
  if (p.kind === 'word' && p.op === '-') return `The shopping costs $${p.total}. Count up from $${p.total} to $${p.note}.`;
  return strategyFor(p).line;
}

// ── carry & borrow sheet ─────────────────────────────────────
// 12 problems: 3 add, 3 subtract, 3 shopping-total, 3 change-back — all two-digit.
function columnSheet(key) {
  const rnd = seeded(seedFrom('column' + key));
  const R = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));
  const shelf = MARKET.slice().sort(() => rnd() - 0.5);
  let at = 0;
  const take = n => { const out = shelf.slice(at, at + n); at += n; return out; };
  const out = [];

  const carryPair = () => { const a1 = R(4, 9), b1 = R(10 - a1, 9), a = R(1, 4) * 10 + a1, b = R(1, 4) * 10 + b1; return [a, b]; };
  const borrowPair = () => { const a1 = R(0, 5), b1 = R(a1 + 1, 9), a = R(3, 8) * 10 + a1, b = R(1, Math.floor(a / 10) - 1) * 10 + b1; return [a, b]; };

  for (let i = 0; i < 3; i++) { const [a, b] = carryPair(); out.push({ id: `c-add-${i}`, group: 'Carrying', kind: 'plain', op: '+', a, b, display: `${a} + ${b}`, answer: a + b }); }
  for (let i = 0; i < 3; i++) { const [a, b] = borrowPair(); out.push({ id: `c-sub-${i}`, group: 'Borrowing', kind: 'plain', op: '-', a, b, display: `${a} ${MINUS} ${b}`, answer: a - b }); }
  for (let i = 0; i < 3; i++) {
    const [a, b] = carryPair(); const items = take(2).map((it, k) => ({ ...it, price: k === 0 ? a : b }));
    out.push({ id: `c-wadd-${i}`, group: 'Market bill', kind: 'word', op: '+', a, b, items,
      text: `You buy ${items[0].name} for $${a} and ${items[1].name} for $${b}. What is the whole bill?`, answer: a + b });
  }
  for (let i = 0; i < 3; i++) {
    const [a, b] = borrowPair(); const items = take(1).map(it => ({ ...it, price: b }));
    out.push({ id: `c-wsub-${i}`, group: 'Change back', kind: 'word', op: '-', a, b, items, note: a, total: b,
      text: `You have $${a} and buy ${items[0].name} for $${b}. How much money is left?`, answer: a - b });
  }
  return out;
}

// Guided column method. Steps are answered one at a time; `after` mutates the
// drawing so the child sees the carried 1 / crossed-out ten appear as they go.
function columnPlan(p) {
  const a = p.a, b = p.b, op = p.op;
  const a1 = a % 10, a10 = Math.floor(a / 10), b1 = b % 10, b10 = Math.floor(b / 10);
  if (op === '+') {
    const onesSum = a1 + b1, carry = onesSum >= 10 ? 1 : 0;
    const steps = [
      { text: `Add the ones: ${a1} + ${b1}`, answer: onesSum, reveal: carry ? { carry: 1, resOnes: onesSum % 10 } : { resOnes: onesSum } },
    ];
    steps.push(carry
      ? { text: `Now the tens, and don't forget the 1 you carried: 1 + ${a10} + ${b10}`, answer: carry + a10 + b10, reveal: { resTens: carry + a10 + b10 } }
      : { text: `Add the tens: ${a10} + ${b10}`, answer: a10 + b10, reveal: { resTens: a10 + b10 } });
    return { steps, carry, note: carry ? `${a1} + ${b1} is ${onesSum}. Write the ${onesSum % 10} under the ones and carry the 1 over to the tens.` : 'No carrying needed here.' };
  }
  const borrow = a1 < b1;
  const steps = [
    { kind: 'yesno', text: `Is ${a1} big enough to take ${b1} away?`, answer: borrow ? 'no' : 'yes',
      reveal: borrow ? { borrow: true, tensNew: a10 - 1, onesNew: a1 + 10 } : {} },
  ];
  if (borrow) {
    steps.push({ text: `Borrowed a ten. Now do ${a1 + 10} ${MINUS} ${b1}`, answer: a1 + 10 - b1, reveal: { resOnes: a1 + 10 - b1 } });
    steps.push({ text: `The ${a10} became ${a10 - 1}. Now ${a10 - 1} ${MINUS} ${b10}`, answer: a10 - 1 - b10, reveal: { resTens: a10 - 1 - b10 } });
  } else {
    steps.push({ text: `Take the ones: ${a1} ${MINUS} ${b1}`, answer: a1 - b1, reveal: { resOnes: a1 - b1 } });
    steps.push({ text: `Take the tens: ${a10} ${MINUS} ${b10}`, answer: a10 - b10, reveal: { resTens: a10 - b10 } });
  }
  return { steps, borrow, note: borrow
    ? `${a1} is smaller than ${b1}, so cross out the ${a10} and make it ${a10 - 1}. The ${a1} becomes ${a1 + 10}.`
    : 'Nothing to borrow — the ones are big enough.' };
}

