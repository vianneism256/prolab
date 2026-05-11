// ═══════════════════════════════════════════
//   ProbLab — script.js
// ═══════════════════════════════════════════

// ── MODULE NAVIGATION ──────────────────────
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.module').forEach(m => m.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('module-' + btn.dataset.module).classList.add('active');
  });
});

// ── TAB NAVIGATION ─────────────────────────
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const mod = tab.closest('.module') || tab.closest('section');
    mod.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    mod.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    const tc = mod.querySelector('#tab-' + tab.dataset.tab);
    if (tc) tc.classList.add('active');
  });
});

// ── MATH UTILITIES ─────────────────────────
function factorial(n) {
  if (n < 0 || n > 20) return Infinity;
  if (n === 0 || n === 1) return 1;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function permutation(n, r) {
  if (r > n || n < 0 || r < 0) return 0;
  return factorial(n) / factorial(n - r);
}

function combination(n, r) {
  if (r > n || n < 0 || r < 0) return 0;
  if (r === 0 || r === n) return 1;
  // Use smaller r for efficiency
  if (r > n - r) r = n - r;
  let res = 1;
  for (let i = 0; i < r; i++) {
    res = res * (n - i) / (i + 1);
  }
  return Math.round(res);
}

function parseSet(str) {
  return [...new Set(
    str.split(',')
       .map(s => s.trim())
       .filter(s => s !== '')
  )];
}

function setUnion(a, b) {
  return [...new Set([...a, ...b])];
}

function setIntersect(a, b) {
  return a.filter(x => b.includes(x));
}

function setDiff(a, b) {
  return a.filter(x => !b.includes(x));
}

function setComplement(a, u) {
  return setDiff(u, a);
}

function fmt(n) {
  if (!isFinite(n)) return '∞';
  if (Number.isInteger(n)) return n.toLocaleString();
  return parseFloat(n.toFixed(6)).toLocaleString();
}

// ═══════════════════════════════════════════
//   MODULE 1 — SET THEORY
// ═══════════════════════════════════════════

let currentOp = 'union';

document.querySelectorAll('.op-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.op-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentOp = btn.dataset.op;
  });
});

const opMeta = {
  union:        { label: 'A ∪ B',  formula: 'A ∪ B = { x | x ∈ A  or  x ∈ B }' },
  intersection: { label: 'A ∩ B',  formula: 'A ∩ B = { x | x ∈ A  and  x ∈ B }' },
  diffAB:       { label: 'A − B',  formula: 'A − B = { x | x ∈ A  and  x ∉ B }' },
  diffBA:       { label: 'B − A',  formula: 'B − A = { x | x ∈ B  and  x ∉ A }' },
  compA:        { label: "A′",     formula: "A′ = U − A = { x ∈ U | x ∉ A }" },
  compB:        { label: "B′",     formula: "B′ = U − B = { x ∈ U | x ∉ B }" },
};

function computeSets() {
  const rawA = document.getElementById('setA').value;
  const rawB = document.getElementById('setB').value;
  const rawU = document.getElementById('setU').value;

  if (!rawA.trim() || !rawB.trim()) {
    showSetResult([], 'Error: Please define both Set A and Set B.', '', null, null, null, null, true);
    return;
  }

  const A = parseSet(rawA);
  const B = parseSet(rawB);
  const U = rawU.trim() ? parseSet(rawU) : setUnion(A, B);

  let result = [];
  switch (currentOp) {
    case 'union':        result = setUnion(A, B); break;
    case 'intersection': result = setIntersect(A, B); break;
    case 'diffAB':       result = setDiff(A, B); break;
    case 'diffBA':       result = setDiff(B, A); break;
    case 'compA':        result = setComplement(A, U); break;
    case 'compB':        result = setComplement(B, U); break;
  }

  const inter = setIntersect(A, B);
  const meta  = opMeta[currentOp];

  showSetResult(result, meta.label, meta.formula, A, B, U, inter, false);
  updateVenn(A, B, U, currentOp, inter);
}

function showSetResult(result, label, formula, A, B, U, inter, isError) {
  document.getElementById('setResultLabel').textContent  = isError ? '' : label;
  document.getElementById('setResultFormula').textContent = isError ? label : formula;

  const cloud = document.getElementById('setResultElems');
  if (isError) {
    cloud.innerHTML = `<span class="placeholder-text err-text">${label}</span>`;
  } else if (result.length === 0) {
    cloud.innerHTML = '<span class="elem-tag empty">∅</span>';
  } else {
    cloud.innerHTML = result.map(e => `<span class="elem-tag">${e}</span>`).join('');
  }

  const stats = document.getElementById('setStats');
  if (A && B && U && inter !== null) {
    const meta = opMeta[currentOp];
    stats.innerHTML = `
      <span class="stat-chip">|A| = <em>${A.length}</em></span>
      <span class="stat-chip">|B| = <em>${B.length}</em></span>
      <span class="stat-chip">|A ∩ B| = <em>${inter.length}</em></span>
      <span class="stat-chip">|${meta.label}| = <em>${result.length}</em></span>
      <span class="stat-chip">|U| = <em>${U.length}</em></span>
    `;
  } else {
    stats.innerHTML = '';
  }
}

function updateVenn(A, B, U, op, inter) {
  const ids = ['regionAonly', 'regionIntersect', 'regionBonly', 'regionOutside'];
  ids.forEach(id => document.getElementById(id).setAttribute('opacity', '0'));

  const show = id => document.getElementById(id).setAttribute('opacity', '1');

  switch (op) {
    case 'union':
      show('regionAonly'); show('regionIntersect'); show('regionBonly');
      break;
    case 'intersection':
      show('regionIntersect');
      break;
    case 'diffAB':
      show('regionAonly');
      break;
    case 'diffBA':
      show('regionBonly');
      break;
    case 'compA':
      show('regionBonly'); show('regionOutside');
      break;
    case 'compB':
      show('regionAonly'); show('regionOutside');
      break;
  }

  const txt = document.getElementById('vennIntersectText');
  if (inter.length > 0) {
    txt.textContent = inter.length <= 5
      ? inter.join(', ')
      : inter.slice(0, 4).join(', ') + '…';
  } else {
    txt.textContent = '∅';
  }
}

// ═══════════════════════════════════════════
//   MODULE 2 — COUNTING
// ═══════════════════════════════════════════

function computePermutation() {
  const n = parseInt(document.getElementById('permN').value);
  const r = parseInt(document.getElementById('permR').value);
  const el = document.getElementById('permResult');
  el.classList.remove('hidden');

  if (isNaN(n) || isNaN(r) || n < 0 || r < 0) {
    el.innerHTML = '<span class="err-text">Invalid input. n and r must be non-negative integers.</span>';
    return;
  }
  if (r > n) {
    el.innerHTML = '<span class="err-text">r cannot exceed n for permutations.</span>';
    return;
  }
  if (n > 20) {
    el.innerHTML = '<span class="err-text">n must be ≤ 20 to avoid overflow.</span>';
    return;
  }

  const result = permutation(n, r);
  const nf     = factorial(n);
  const nmrf   = factorial(n - r);

  el.innerHTML = `
    <div class="step-row"><span class="step-i">Formula</span><span>P(${n}, ${r}) = ${n}! / (${n} − ${r})!</span></div>
    <div class="step-row"><span class="step-i">Step 1</span><span>= ${n}! / ${n - r}!</span></div>
    <div class="step-row"><span class="step-i">Step 2</span><span>= ${fmt(nf)} / ${fmt(nmrf)}</span></div>
    <div class="step-total">P(${n}, ${r}) = ${fmt(result)}</div>
    <div class="step-note">This means there are <strong>${fmt(result)}</strong> ordered arrangements of ${r} items from ${n}.</div>
  `;
}

function computeCombination() {
  const n = parseInt(document.getElementById('combN').value);
  const r = parseInt(document.getElementById('combR').value);
  const el = document.getElementById('combResult');
  el.classList.remove('hidden');

  if (isNaN(n) || isNaN(r) || n < 0 || r < 0) {
    el.innerHTML = '<span class="err-text">Invalid input. n and r must be non-negative integers.</span>';
    return;
  }
  if (r > n) {
    el.innerHTML = '<span class="err-text">r cannot exceed n for combinations.</span>';
    return;
  }
  if (n > 20) {
    el.innerHTML = '<span class="err-text">n must be ≤ 20 to avoid overflow.</span>';
    return;
  }

  const result = combination(n, r);
  const nf     = factorial(n);
  const rf     = factorial(r);
  const nmrf   = factorial(n - r);
  const denom  = rf * nmrf;
  const sym    = combination(n, n - r);

  el.innerHTML = `
    <div class="step-row"><span class="step-i">Formula</span><span>C(${n}, ${r}) = ${n}! / (${r}! · (${n} − ${r})!)</span></div>
    <div class="step-row"><span class="step-i">Step 1</span><span>= ${fmt(nf)} / (${fmt(rf)} · ${fmt(nmrf)})</span></div>
    <div class="step-row"><span class="step-i">Step 2</span><span>= ${fmt(nf)} / ${fmt(denom)}</span></div>
    <div class="step-total">C(${n}, ${r}) = ${fmt(result)}</div>
    <div class="step-note">Symmetry check: C(${n}, ${n - r}) = ${fmt(sym)} ✓ &nbsp;|&nbsp; There are <strong>${fmt(result)}</strong> unordered selections of ${r} from ${n}.</div>
  `;
}

// Sum Rule
let sumTasks = [4, 3];

function renderSumTasks() {
  const c = document.getElementById('sumTasksContainer');
  c.innerHTML = sumTasks.map((v, i) => `
    <div class="input-group">
      <label>Task ${i + 1} ways</label>
      <input type="number" class="sum-task" value="${v}" min="0" onchange="sumTasks[${i}] = parseInt(this.value)||0">
    </div>
  `).join('');
}

function addSumTask() {
  sumTasks.push(2);
  renderSumTasks();
}

function computeSumRule() {
  const vals  = [...document.querySelectorAll('.sum-task')].map(i => parseInt(i.value) || 0);
  const total = vals.reduce((a, b) => a + b, 0);
  const el    = document.getElementById('sumRuleResult');
  el.classList.remove('hidden');
  el.innerHTML = `
    <div class="step-row"><span class="step-i">Formula</span><span>${vals.join(' + ')} = ?</span></div>
    ${vals.map((v, i) => `<div class="step-row"><span class="step-i">Task ${i+1}</span><span>${v} ways</span><span class="step-val">running: ${vals.slice(0,i+1).reduce((a,b)=>a+b,0)}</span></div>`).join('')}
    <div class="step-total">Total ways (Sum Rule) = ${fmt(total)}</div>
    <div class="step-note">Since the tasks are mutually exclusive, we simply add their individual counts.</div>
  `;
}

// Product Rule
let prodTasks = [3, 4];

function renderProdTasks() {
  const c = document.getElementById('prodTasksContainer');
  c.innerHTML = prodTasks.map((v, i) => `
    <div class="input-group">
      <label>Stage ${i + 1} choices</label>
      <input type="number" class="prod-task" value="${v}" min="0" onchange="prodTasks[${i}] = parseInt(this.value)||0">
    </div>
  `).join('');
}

function addProdTask() {
  prodTasks.push(2);
  renderProdTasks();
}

function computeProductRule() {
  const vals  = [...document.querySelectorAll('.prod-task')].map(i => parseInt(i.value) || 0);
  const total = vals.reduce((a, b) => a * b, 1);
  const el    = document.getElementById('prodRuleResult');
  el.classList.remove('hidden');
  let running = 1;
  el.innerHTML = `
    <div class="step-row"><span class="step-i">Formula</span><span>${vals.join(' × ')} = ?</span></div>
    ${vals.map((v, i) => {
      running *= v;
      return `<div class="step-row"><span class="step-i">Stage ${i+1}</span><span>${v} choices</span><span class="step-val">running: ${fmt(running)}</span></div>`;
    }).join('')}
    <div class="step-total">Total outcomes (Product Rule) = ${fmt(total)}</div>
    <div class="step-note">Since stages are independent, we multiply the number of choices at each stage.</div>
  `;
}

// ═══════════════════════════════════════════
//   MODULE 3 — SUMMATION & PRODUCT
// ═══════════════════════════════════════════

const exprLabel = {
  'i':                    'i',
  'i*i':                  'i²',
  'i*i*i':                'i³',
  '2*i+1':                '2i + 1',
  'i*(i+1)':              'i(i+1)',
  '1/i':                  '1/i',
  'Math.pow(2,i)':        '2ⁱ',
  'Math.pow(-1,i)*i':     '(−1)ⁱ · i',
  '2*i':                  '2i',
  'i+1':                  'i + 1',
  '(i+1)/i':              '(i+1)/i',
};

function safeEval(expr, i) {
  try {
    // eslint-disable-next-line no-new-func
    return Function('i', 'Math', `"use strict"; return (${expr})`)(i, Math);
  } catch {
    return NaN;
  }
}

function computeSummation() {
  const start = parseInt(document.getElementById('sigmaStart').value);
  const end   = parseInt(document.getElementById('sigmaEnd').value);
  const expr  = document.getElementById('sigmaExpr').value;
  const el    = document.getElementById('summationResult');
  el.classList.remove('hidden');

  if (isNaN(start) || isNaN(end)) { el.innerHTML = '<span class="err-text">Invalid bounds.</span>'; return; }
  if (end < start) { el.innerHTML = '<span class="err-text">End must be ≥ start.</span>'; return; }
  if (end - start > 99) { el.innerHTML = '<span class="err-text">Max 100 terms.</span>'; return; }

  const lbl = exprLabel[expr] || expr;
  let total = 0;
  let rows  = '';

  for (let i = start; i <= end; i++) {
    const v = safeEval(expr, i);
    if (isNaN(v)) { el.innerHTML = `<span class="err-text">Expression error at i = ${i}.</span>`; return; }
    total += v;
    const dispV = Number.isInteger(v) ? v : v.toFixed(4);
    const dispT = Number.isInteger(total) ? total : total.toFixed(4);
    rows += `<div class="step-row"><span class="step-i">i = ${i}</span><span>f(${i}) = ${dispV}</span><span class="step-val">∑ = ${dispT}</span></div>`;
  }

  document.getElementById('sumLimitTop').textContent = end;
  document.getElementById('sumLimitBot').textContent = `i = ${start}`;
  document.getElementById('sumExprDisplay').textContent = lbl;

  el.innerHTML = `
    <div style="font-size:11px;color:var(--text-muted);margin-bottom:10px">Evaluating Σ (${lbl}) for i = ${start} to ${end}</div>
    ${rows}
    <div class="step-total">Σ = ${fmt(total)}</div>
  `;
}

function computeProduct() {
  const start = parseInt(document.getElementById('piStart').value);
  const end   = parseInt(document.getElementById('piEnd').value);
  const expr  = document.getElementById('piExpr').value;
  const el    = document.getElementById('productResult');
  el.classList.remove('hidden');

  if (isNaN(start) || isNaN(end)) { el.innerHTML = '<span class="err-text">Invalid bounds.</span>'; return; }
  if (end < start) { el.innerHTML = '<span class="err-text">End must be ≥ start.</span>'; return; }
  if (end - start > 20) { el.innerHTML = '<span class="err-text">Max 21 terms for product.</span>'; return; }

  const lbl = exprLabel[expr] || expr;
  let total = 1;
  let rows  = '';

  for (let i = start; i <= end; i++) {
    const v = safeEval(expr, i);
    if (isNaN(v)) { el.innerHTML = `<span class="err-text">Expression error at i = ${i}.</span>`; return; }
    total *= v;
    const dispV = Number.isInteger(v) ? v : v.toFixed(4);
    const dispT = Number.isInteger(total) ? total : total.toFixed(4);
    rows += `<div class="step-row"><span class="step-i">i = ${i}</span><span>f(${i}) = ${dispV}</span><span class="step-val">∏ = ${dispT}</span></div>`;
  }

  document.getElementById('piLimitTop').textContent = end;
  document.getElementById('piLimitBot').textContent = `i = ${start}`;
  document.getElementById('piExprDisplay').textContent = lbl;

  el.innerHTML = `
    <div style="font-size:11px;color:var(--text-muted);margin-bottom:10px">Evaluating Π (${lbl}) for i = ${start} to ${end}</div>
    ${rows}
    <div class="step-total">Π = ${fmt(total)}</div>
  `;
}

// ═══════════════════════════════════════════
//   MODULE 4 — PROBABILITY
// ═══════════════════════════════════════════

function computeProbability() {
  const rawS = document.getElementById('sampleSpace').value;
  const rawA = document.getElementById('eventA').value;
  const rawB = document.getElementById('eventB').value;
  const probDiv  = document.getElementById('probResults');
  const axiomDiv = document.getElementById('axiomResults');
  const axiomCard = document.getElementById('axiomCard');

  if (!rawS.trim() || !rawA.trim()) {
    probDiv.innerHTML = '<div class="card"><span class="err-text">Please define the sample space and at least Event A.</span></div>';
    axiomCard.style.display = 'none';
    return;
  }

  const S  = parseSet(rawS);
  const Ae = parseSet(rawA).filter(x => S.includes(x));
  const Be = rawB.trim() ? parseSet(rawB).filter(x => S.includes(x)) : [];

  if (S.length === 0) {
    probDiv.innerHTML = '<div class="card"><span class="err-text">Sample space cannot be empty.</span></div>';
    axiomCard.style.display = 'none';
    return;
  }

  const pA      = Ae.length / S.length;
  const pAc     = 1 - pA;
  const hasB    = Be.length > 0;
  const pB      = hasB ? Be.length / S.length : null;
  const aInterB = hasB ? setIntersect(Ae, Be) : [];
  const pAiB    = aInterB.length / S.length;
  const aUnionB = hasB ? setUnion(Ae, Be).filter(x => S.includes(x)) : [];
  const pAuB    = hasB ? aUnionB.length / S.length : null;
  const isME    = hasB && aInterB.length === 0;

  // ── Probability cards
  let cardsHtml = '<div class="prob-grid">';
  cardsHtml += probCardHtml('|Ω| Sample Space', S.length, '', '');
  cardsHtml += probCardHtml('|A| Event A',   Ae.length, '', '');
  cardsHtml += probCardHtml('P(A)',  pA.toFixed(4),  `${Ae.length} / ${S.length}`, '');
  cardsHtml += probCardHtml("P(A′)", pAc.toFixed(4), `${S.length - Ae.length} / ${S.length}`, '');

  if (hasB) {
    cardsHtml += probCardHtml('|B| Event B',   Be.length, '', '');
    cardsHtml += probCardHtml('P(B)',   pB.toFixed(4),  `${Be.length} / ${S.length}`, '');
    cardsHtml += probCardHtml('P(A ∩ B)', pAiB.toFixed(4), `${aInterB.length} / ${S.length}`, '');
    cardsHtml += probCardHtml('P(A ∪ B)', pAuB.toFixed(4), `${aUnionB.length} / ${S.length}`, '');
    cardsHtml += `<div class="prob-card ${isME ? 'pass' : 'fail'}">
      <div class="prob-card-label">Mutually Exclusive?</div>
      <div class="prob-card-value ${isME ? 'success' : 'danger'}" style="font-size:20px">${isME ? '✓ Yes' : '✗ No'}</div>
      <div class="prob-card-sub">A ∩ B = ${aInterB.length === 0 ? '∅' : '{' + aInterB.join(', ') + '}'}</div>
    </div>`;
  }
  cardsHtml += '</div>';

  // ── Step-by-step verification
  let verHtml = '<div class="card"><h2>Step-by-Step Verification</h2>';
  verHtml += `
    <div class="step-row"><span class="step-i">P(A)</span><span>|A| / |Ω| = ${Ae.length} / ${S.length}</span><span class="step-val">${pA.toFixed(4)}</span></div>
    <div class="step-row"><span class="step-i">P(A′)</span><span>1 − P(A) = 1 − ${pA.toFixed(4)}</span><span class="step-val">${pAc.toFixed(4)}</span></div>
    <div class="step-row"><span class="step-i">P(A)+P(A′)</span><span>${pA.toFixed(4)} + ${pAc.toFixed(4)}</span><span class="step-val ok-text">${(pA + pAc).toFixed(4)} ✓</span></div>
  `;
  if (hasB) {
    const addRule = pA + pB - pAiB;
    verHtml += `
      <div class="step-row"><span class="step-i">Addition</span><span>P(A∪B) = P(A)+P(B)−P(A∩B) = ${pA.toFixed(3)}+${pB.toFixed(3)}−${pAiB.toFixed(3)}</span><span class="step-val ok-text">${addRule.toFixed(4)} ✓</span></div>
    `;
    if (isME) {
      verHtml += `<div class="step-row"><span class="step-i">ME rule</span><span>Mutually exclusive → P(A∪B) = P(A)+P(B) = ${(pA + pB).toFixed(4)}</span><span class="step-val ok-text">✓</span></div>`;
    }
  }
  verHtml += '</div>';

  probDiv.innerHTML = cardsHtml + verHtml;

  // ── Axioms
  axiomCard.style.display = 'block';
  const axiom1 = pA >= 0 && pA <= 1 && (!hasB || (pB >= 0 && pB <= 1));
  const axiom2 = true; // P(S) = |S|/|S| = 1 always
  const axiom3 = hasB ? Math.abs(pAuB - (pA + pB - pAiB)) < 1e-9 : true;

  axiomDiv.innerHTML = `
    <div class="axiom-card ${axiom1 ? 'pass' : 'fail'}">
      <div class="axiom-status">${axiom1 ? '✅' : '❌'}</div>
      <div class="axiom-name">Axiom 1 — Non-negativity</div>
      <div class="axiom-desc">0 ≤ P(E) ≤ 1 for all events E</div>
    </div>
    <div class="axiom-card ${axiom2 ? 'pass' : 'fail'}">
      <div class="axiom-status">${axiom2 ? '✅' : '❌'}</div>
      <div class="axiom-name">Axiom 2 — Normalization</div>
      <div class="axiom-desc">P(Ω) = |Ω| / |Ω| = 1</div>
    </div>
    <div class="axiom-card ${axiom3 ? 'pass' : 'fail'}">
      <div class="axiom-status">${axiom3 ? '✅' : '❌'}</div>
      <div class="axiom-name">Axiom 3 — Additivity</div>
      <div class="axiom-desc">P(A∪B) = P(A)+P(B)−P(A∩B)${!hasB ? '\n(define Event B to verify)' : ''}</div>
    </div>
  `;
}

function probCardHtml(label, value, sub, extra) {
  return `<div class="prob-card">
    <div class="prob-card-label">${label}</div>
    <div class="prob-card-value">${value}</div>
    ${sub ? `<div class="prob-card-sub">${sub}</div>` : ''}
  </div>`;
}

// ═══════════════════════════════════════════
//   MODULE 5 — BINOMIAL & PASCAL
// ═══════════════════════════════════════════

function drawPascal() {
  const n   = Math.min(Math.max(parseInt(document.getElementById('pascalRows').value) || 8, 1), 12);
  const con = document.getElementById('pascalContainer');
  con.innerHTML = '';

  // Build triangle data
  const tri = [];
  for (let i = 0; i < n; i++) {
    tri.push([]);
    for (let j = 0; j <= i; j++) {
      tri[i].push(combination(i, j));
    }
  }

  tri.forEach((row, i) => {
    const rowEl = document.createElement('div');
    rowEl.className = 'pascal-row';
    row.forEach((val, j) => {
      const cell = document.createElement('div');
      cell.className = 'pascal-cell' + (j === 0 || j === i ? ' edge' : '');
      cell.textContent = val;
      cell.title = `C(${i}, ${j}) = ${val}`;

      // Hover: highlight column
      cell.addEventListener('mouseenter', () => {
        document.querySelectorAll('.pascal-cell').forEach(c => c.classList.remove('highlight'));
        tri.forEach((r, ri) => {
          if (j <= ri) {
            const cells = document.querySelectorAll(`.pascal-row:nth-child(${ri + 1}) .pascal-cell`);
            if (cells[j]) cells[j].classList.add('highlight');
          }
        });
      });
      cell.addEventListener('mouseleave', () => {
        document.querySelectorAll('.pascal-cell').forEach(c => c.classList.remove('highlight'));
      });

      rowEl.appendChild(cell);
    });
    con.appendChild(rowEl);
  });
}

function buildTerm(coeff, a, aPow, b, bPow) {
  let t = '';
  const showCoeff = coeff !== 1 || (aPow === 0 && bPow === 0);
  if (showCoeff) t += coeff;
  if (aPow === 1)       t += a;
  else if (aPow > 1)    t += `${a}^${aPow}`;
  if (bPow === 1)       t += b;
  else if (bPow > 1)    t += `${b}^${bPow}`;
  return t || '1';
}

function expandBinomial() {
  const a  = document.getElementById('biA').value.trim() || 'x';
  const b  = document.getElementById('biB').value.trim() || 'y';
  const n  = parseInt(document.getElementById('biN').value);
  const el = document.getElementById('binomialResult');
  el.classList.remove('hidden');

  if (isNaN(n) || n < 0 || n > 10) {
    el.innerHTML = '<span class="err-text">n must be an integer between 0 and 10.</span>';
    return;
  }

  const terms = [];
  let rows    = '';

  for (let k = 0; k <= n; k++) {
    const c    = combination(n, k);
    const aPow = n - k;
    const bPow = k;
    const term = buildTerm(c, a, aPow, b, bPow);
    terms.push(term);

    const aStr = aPow === 0 ? '1' : (aPow === 1 ? a : `${a}^${aPow}`);
    const bStr = bPow === 0 ? '1' : (bPow === 1 ? b : `${b}^${bPow}`);
    rows += `<div class="step-row">
      <span class="step-i">k = ${k}</span>
      <span>C(${n},${k}) · ${aStr} · ${bStr} = ${c} · ${aStr} · ${bStr}</span>
      <span class="step-val">${term}</span>
    </div>`;
  }

  const expansion = terms.join(' + ');
  el.innerHTML = `
    <div style="font-size:11px;color:var(--text-muted);margin-bottom:10px">Expanding (${a} + ${b})^${n}</div>
    ${rows}
    <div class="step-total">(${a} + ${b})^${n} = ${expansion}</div>
  `;
}

function computeInclusionExclusion() {
  const A  = parseInt(document.getElementById('ieA').value);
  const B  = parseInt(document.getElementById('ieB').value);
  const AB = parseInt(document.getElementById('ieAB').value);
  const el = document.getElementById('ieResult');
  el.classList.remove('hidden');

  if (isNaN(A) || isNaN(B) || isNaN(AB)) {
    el.innerHTML = '<span class="err-text">Please fill all three fields.</span>';
    return;
  }
  if (AB > A || AB > B) {
    el.innerHTML = '<span class="err-text">|A ∩ B| cannot exceed |A| or |B|.</span>';
    return;
  }

  const result = A + B - AB;
  el.innerHTML = `
    <div class="step-row"><span class="step-i">Formula</span><span>|A ∪ B| = |A| + |B| − |A ∩ B|</span></div>
    <div class="step-row"><span class="step-i">Step 1</span><span>|A| + |B| = ${A} + ${B}</span><span class="step-val">${A + B}</span></div>
    <div class="step-row"><span class="step-i">Step 2</span><span>${A + B} − |A ∩ B| = ${A + B} − ${AB}</span><span class="step-val">${result}</span></div>
    <div class="step-total">|A ∪ B| = ${result}</div>
    <div class="step-note">Without inclusion-exclusion, naively adding |A|+|B| = ${A + B} overcounts the ${AB} element(s) in the intersection.</div>
  `;
}

function computePigeonhole() {
  const n  = parseInt(document.getElementById('phN').value);
  const k  = parseInt(document.getElementById('phK').value);
  const el = document.getElementById('phResult');
  el.classList.remove('hidden');

  if (isNaN(n) || isNaN(k) || n < 1 || k < 1) {
    el.innerHTML = '<span class="err-text">n and k must be positive integers.</span>';
    return;
  }

  const guaranteed = Math.ceil(n / k);
  const floor      = Math.floor(n / k);
  const rem        = n % k;

  // Visual boxes
  let boxes = '<div style="display:flex;gap:8px;flex-wrap:wrap;margin:14px 0">';
  for (let i = 0; i < Math.min(k, 20); i++) {
    const count = i < rem ? guaranteed : floor;
    const isMax = count === guaranteed && guaranteed > floor;
    boxes += `<div style="
      background:var(--bg3);
      border:1px solid ${isMax ? 'rgba(0,229,160,0.4)' : 'var(--border)'};
      border-radius:7px;padding:8px 12px;text-align:center;min-width:54px
    ">
      <div style="font-size:9px;color:var(--text-muted);margin-bottom:4px;font-family:Syne,sans-serif;font-weight:600">Box ${i+1}</div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:18px;color:${isMax ? 'var(--accent)' : 'var(--text-dim)'}">${count}</div>
    </div>`;
  }
  if (k > 20) boxes += `<div style="color:var(--text-muted);font-size:11px;align-self:center">+${k-20} more…</div>`;
  boxes += '</div>';

  el.innerHTML = `
    <div class="step-row"><span class="step-i">n items</span><span>${n} items distributed into ${k} containers</span></div>
    <div class="step-row"><span class="step-i">Formula</span><span>⌈${n} / ${k}⌉ = ⌈${(n/k).toFixed(4)}⌉</span></div>
    ${boxes}
    <div class="step-total">At least <strong>${guaranteed}</strong> item${guaranteed !== 1 ? 's' : ''} guaranteed in one container.</div>
    <div class="step-note">This is certain regardless of how the items are distributed — that's the power of the Pigeonhole Principle.</div>
  `;
}

// ═══════════════════════════════════════════
//   INIT
// ═══════════════════════════════════════════

// Initialize task inputs
renderSumTasks();
renderProdTasks();

// Draw Pascal's triangle on load
drawPascal();
