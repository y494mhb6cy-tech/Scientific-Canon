/* ============================================================
   Semantic Physics Map — app.js
   Zero-dependency Canon sequence wizard + 2D field visualization
   ============================================================ */

const App = (() => {
  'use strict';

  // ─── Constants ──────────────────────────────────────────────
  const STORAGE_KEY = 'spm_runs';
  const STEP_COUNT = 6;
  const STEP_NAMES = ['Input', 'Frame', 'Gradient', 'Vector', 'Drift Check', 'Coordinate'];

  // Fixed 2×9 projection matrix: maps 9D semantic axes → 2D field
  // X = Concrete(−) ↔ Abstract(+), Y = Static(−) ↔ Dynamic(+)
  const PROJ_MATRIX = {
    x: [ 0.35, 0.40, -0.15,  0.30, 0.20, -0.10, -0.25, -0.30,  0.20],
    y: [-0.10, -0.20,  0.30, -0.35, -0.15,  0.25,  0.40,  0.20,  0.35]
  };

  const AXIS_KEYS = [
    'scopeSpan', 'epistemicStance', 'agencyLocus',
    'rigidity', 'constraintDensity', 'reversibility',
    'magnitude', 'specificity', 'temporalOrientation'
  ];

  const QUADRANT_LABELS = [
    { x:  1, y:  1, label: 'Abstract Dynamic',  color: '#bc8cff' },
    { x: -1, y:  1, label: 'Concrete Dynamic',  color: '#3fb950' },
    { x: -1, y: -1, label: 'Concrete Static',   color: '#58a6ff' },
    { x:  1, y: -1, label: 'Abstract Static',   color: '#d29922' }
  ];

  const FORCE_TYPES = [
    { id: 'abstraction',   name: 'Abstraction Attractor',       color: '#bc8cff' },
    { id: 'constraint',    name: 'Constraint Trap',             color: '#d29922' },
    { id: 'action',        name: 'Action Bias',                 color: '#3fb950' },
    { id: 'authority',     name: 'Authority-Epistemic Tension', color: '#f85149' },
    { id: 'scope_agency',  name: 'Scope-Agency Overreach',      color: '#db6d28' },
    { id: 'temporal',      name: 'Temporal Binding',            color: '#58a6ff' },
    { id: 'neighbor',      name: 'Neighbor Gravity',            color: '#8b949e' }
  ];

  // Non-commutativity regex patterns (cross-role language leaks)
  const NONCOMMUTE_PATTERNS = {
    actionInFrame: /\b(must|should|will|require|demand|force|act|execute|implement|launch|push)\b/i,
    frameInVector: /\b(observe|measure|scope|boundary|context|frame|lens|perspective)\b/i,
    gradientInVector: /\b(constraint|limit|boundary|rigid|flexible|invariant|condition)\b/i
  };

  // ─── State ──────────────────────────────────────────────────
  let currentStep = 0;
  let currentRun = null;
  let allRuns = [];
  let fieldRenderer = null;
  let compareSelection = [];

  // ─── Run Constructor ────────────────────────────────────────
  function createRun() {
    return {
      id: crypto.randomUUID ? crypto.randomUUID() : 'run_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      timestamp: new Date().toISOString(),
      utterance: '',
      domainTags: [],
      audience: '',
      stakes: 'medium',
      frame: {
        observerRole: '', contextScope: '', measurementBasis: '', sentence: '',
        axes: { scopeSpan: 0.5, epistemicStance: 0.5, agencyLocus: 0.5 }
      },
      gradient: {
        invariants: [], boundaryConditions: [], costSurface: '', constraints: [],
        axes: { rigidity: 0.5, constraintDensity: 0.5, reversibility: 0.5 }
      },
      vector: {
        intent: '', actionType: 'assert', targetVariables: [], arrowDescriptor: '',
        axes: { magnitude: 0.5, specificity: 0.5, temporalOrientation: 0.5 }
      },
      drift: {
        roleCollapseDetected: false, collapseType: null,
        nonCommutativityFlag: false, overdominanceRole: null,
        riskLevel: 'none', report: '', balanceVector: [0, 0, 0]
      },
      coordinate: { x: 0, y: 0, confidence: 0, method: '9d-projection' },
      neighbors: [],
      competition: [],
      notes: ''
    };
  }

  // ─── Storage ────────────────────────────────────────────────
  function loadRuns() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      allRuns = raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('Failed to load runs:', e);
      allRuns = [];
    }
  }

  function saveRuns() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allRuns));
    } catch (e) {
      alert('Storage full! Export your data and clear some runs.');
    }
    updateStorageInfo();
  }

  function updateStorageInfo() {
    const bytes = new Blob([JSON.stringify(allRuns)]).size;
    const kb = (bytes / 1024).toFixed(1);
    document.getElementById('infoStorage').textContent = `Storage: ${kb} KB`;
    document.getElementById('infoRuns').textContent = `Runs: ${allRuns.length}`;
  }

  // ─── Wizard State Machine ──────────────────────────────────
  function goToStep(step) {
    if (step < 0 || step >= STEP_COUNT) return;
    currentStep = step;
    document.querySelectorAll('.wizard-step').forEach((el, i) => {
      el.classList.toggle('active', i === step);
    });
    updateStepIndicator();
    if (step === 4) runDriftCheck();
    if (step === 5) runCoordinateAndField();
  }

  function updateStepIndicator() {
    const bar = document.getElementById('stepIndicator');
    bar.innerHTML = '';
    for (let i = 0; i < STEP_COUNT; i++) {
      const dot = document.createElement('div');
      dot.className = 'step-dot';
      if (i < currentStep) dot.classList.add('completed');
      if (i === currentStep) dot.classList.add('active');
      dot.title = STEP_NAMES[i];
      dot.addEventListener('click', () => {
        if (i <= currentStep) goToStep(i);
      });
      bar.appendChild(dot);
    }
  }

  // ─── Step Collectors ────────────────────────────────────────
  function collectInput() {
    const utt = document.getElementById('inUtterance').value.trim();
    if (!utt) { alert('Please enter a statement.'); return false; }
    currentRun.utterance = utt;
    currentRun.domainTags = document.getElementById('inDomainTags').value.split(',').map(s => s.trim()).filter(Boolean);
    currentRun.audience = document.getElementById('inAudience').value.trim();
    currentRun.stakes = document.getElementById('inStakes').value;
    return true;
  }

  function collectFrame() {
    currentRun.frame.observerRole = document.getElementById('frameObserverRole').value.trim();
    currentRun.frame.contextScope = document.getElementById('frameContextScope').value.trim();
    currentRun.frame.measurementBasis = document.getElementById('frameMeasurementBasis').value.trim();
    currentRun.frame.sentence = document.getElementById('frameSentence').value.trim();
    currentRun.frame.axes.scopeSpan = parseFloat(document.getElementById('axisScopeSpan').value);
    currentRun.frame.axes.epistemicStance = parseFloat(document.getElementById('axisEpistemicStance').value);
    currentRun.frame.axes.agencyLocus = parseFloat(document.getElementById('axisAgencyLocus').value);
    return true;
  }

  function collectGradient() {
    currentRun.gradient.invariants = getListValues('invariantsList');
    currentRun.gradient.boundaryConditions = getListValues('boundaryList');
    currentRun.gradient.costSurface = document.getElementById('gradCostSurface').value.trim();
    currentRun.gradient.constraints = getListValues('constraintsList');
    currentRun.gradient.axes.rigidity = parseFloat(document.getElementById('axisRigidity').value);
    currentRun.gradient.axes.constraintDensity = parseFloat(document.getElementById('axisConstraintDensity').value);
    currentRun.gradient.axes.reversibility = parseFloat(document.getElementById('axisReversibility').value);
    return true;
  }

  function collectVector() {
    currentRun.vector.intent = document.getElementById('vecIntent').value.trim();
    currentRun.vector.actionType = document.getElementById('vecActionType').value;
    currentRun.vector.targetVariables = getListValues('targetVarsList');
    currentRun.vector.arrowDescriptor = document.getElementById('vecArrowDesc').value.trim();
    currentRun.vector.axes.magnitude = parseFloat(document.getElementById('axisMagnitude').value);
    currentRun.vector.axes.specificity = parseFloat(document.getElementById('axisSpecificity').value);
    currentRun.vector.axes.temporalOrientation = parseFloat(document.getElementById('axisTemporalOrientation').value);
    return true;
  }

  // ─── Dynamic Lists ─────────────────────────────────────────
  function addListItem(listId, value = '') {
    const container = document.querySelector(`#${listId} .list-items`);
    const item = document.createElement('div');
    item.className = 'list-item';
    item.innerHTML = `<input type="text" value="${escHtml(value)}" placeholder="Enter value...">
      <button onclick="this.parentElement.remove()">&times;</button>`;
    container.appendChild(item);
    item.querySelector('input').focus();
  }

  function getListValues(listId) {
    return Array.from(document.querySelectorAll(`#${listId} .list-items input`))
      .map(el => el.value.trim()).filter(Boolean);
  }

  // ─── Drift Detection Engine ─────────────────────────────────
  function computeDrift(run) {
    const f = run.frame.axes, g = run.gradient.axes, v = run.vector.axes;
    const frameVec = [f.scopeSpan, f.epistemicStance, f.agencyLocus];
    const gradVec  = [g.rigidity, g.constraintDensity, g.reversibility];
    const vecVec   = [v.magnitude, v.specificity, v.temporalOrientation];

    const mag = arr => Math.sqrt(arr.reduce((s, x) => s + x * x, 0));
    const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
    const cosSim = (a, b) => {
      const ma = mag(a), mb = mag(b);
      return (ma && mb) ? dot(a, b) / (ma * mb) : 0;
    };

    const mF = mag(frameVec), mG = mag(gradVec), mV = mag(vecVec);
    const total = mF + mG + mV || 1;
    const balanceVector = [mF / total, mG / total, mV / total];

    const drift = {
      roleCollapseDetected: false, collapseType: null,
      nonCommutativityFlag: false, overdominanceRole: null,
      riskLevel: 'none', report: '', balanceVector
    };

    let riskScore = 0;
    const issues = [];

    // 1. Overdominance
    if (balanceVector[0] > 0.5) { drift.overdominanceRole = 'Frame'; riskScore += 2; issues.push('Frame overdominance: observer role disproportionately weights the analysis.'); }
    else if (balanceVector[1] > 0.5) { drift.overdominanceRole = 'Gradient'; riskScore += 2; issues.push('Gradient overdominance: constraint structure dominates the semantic space.'); }
    else if (balanceVector[2] > 0.5) { drift.overdominanceRole = 'Vector'; riskScore += 2; issues.push('Vector overdominance: action/intent overshadows framing and constraints.'); }

    // 2. Role collapse
    const pairs = [
      { a: frameVec, b: gradVec, name: 'Frame-Gradient' },
      { a: frameVec, b: vecVec,  name: 'Frame-Vector' },
      { a: gradVec,  b: vecVec,  name: 'Gradient-Vector' }
    ];
    for (const p of pairs) {
      if (cosSim(p.a, p.b) > 0.95) {
        drift.roleCollapseDetected = true;
        drift.collapseType = p.name;
        riskScore += 3;
        issues.push(`Role collapse detected: ${p.name} axes are nearly identical (cosine > 0.95). The roles are not differentiating the statement.`);
      }
    }

    // 3. Non-commutativity (cross-role language leaks)
    const frameTxt = `${run.frame.observerRole} ${run.frame.contextScope} ${run.frame.measurementBasis} ${run.frame.sentence}`;
    const vecTxt = `${run.vector.intent} ${run.vector.arrowDescriptor}`;

    if (NONCOMMUTE_PATTERNS.actionInFrame.test(frameTxt)) {
      drift.nonCommutativityFlag = true;
      riskScore += 1;
      issues.push('Non-commutativity: action-oriented language detected in Frame description. Frame should describe observation, not action.');
    }
    if (NONCOMMUTE_PATTERNS.frameInVector.test(vecTxt)) {
      drift.nonCommutativityFlag = true;
      riskScore += 1;
      issues.push('Non-commutativity: observer/framing language detected in Vector description. Vector should describe intent and force, not perspective.');
    }

    // Risk level
    if (riskScore === 0) drift.riskLevel = 'none';
    else if (riskScore <= 1) drift.riskLevel = 'low';
    else if (riskScore <= 3) drift.riskLevel = 'moderate';
    else if (riskScore <= 5) drift.riskLevel = 'high';
    else drift.riskLevel = 'critical';

    drift.report = issues.length ? issues.join('\n\n') : 'No drift detected. Canon roles are balanced and distinct.';
    return drift;
  }

  function runDriftCheck() {
    const drift = computeDrift(currentRun);
    currentRun.drift = drift;
    const el = document.getElementById('driftResults');
    const bv = drift.balanceVector;
    el.innerHTML = `
      <div class="drift-report">
        <h4>Role Balance</h4>
        <div class="balance-bar">
          <div class="seg seg-frame" style="width:${(bv[0]*100).toFixed(0)}%"></div>
          <div class="seg seg-gradient" style="width:${(bv[1]*100).toFixed(0)}%"></div>
          <div class="seg seg-vector" style="width:${(bv[2]*100).toFixed(0)}%"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);margin-bottom:12px">
          <span style="color:var(--accent)">Frame ${(bv[0]*100).toFixed(0)}%</span>
          <span style="color:var(--yellow)">Gradient ${(bv[1]*100).toFixed(0)}%</span>
          <span style="color:var(--green)">Vector ${(bv[2]*100).toFixed(0)}%</span>
        </div>
        <h4>Risk Level: <span class="risk-badge risk-${drift.riskLevel}">${drift.riskLevel}</span></h4>
        ${drift.overdominanceRole ? `<p style="margin-top:8px;font-size:12px">Overdominant role: <strong>${drift.overdominanceRole}</strong></p>` : ''}
        ${drift.roleCollapseDetected ? `<p style="margin-top:4px;font-size:12px">Collapse: <strong>${drift.collapseType}</strong></p>` : ''}
        ${drift.nonCommutativityFlag ? `<p style="margin-top:4px;font-size:12px">Non-commutativity flag raised</p>` : ''}
        <h4 style="margin-top:12px">Report</h4>
        <p style="font-size:12px;white-space:pre-wrap;margin-top:4px">${escHtml(drift.report)}</p>
      </div>`;
  }

  // ─── Coordinate Engine ──────────────────────────────────────
  function getAxesVector(run) {
    return [
      run.frame.axes.scopeSpan, run.frame.axes.epistemicStance, run.frame.axes.agencyLocus,
      run.gradient.axes.rigidity, run.gradient.axes.constraintDensity, run.gradient.axes.reversibility,
      run.vector.axes.magnitude, run.vector.axes.specificity, run.vector.axes.temporalOrientation
    ];
  }

  function computeCoordinate(run) {
    const v = getAxesVector(run);
    let x = 0, y = 0;
    for (let i = 0; i < 9; i++) {
      x += PROJ_MATRIX.x[i] * (v[i] - 0.5); // center around 0
      y += PROJ_MATRIX.y[i] * (v[i] - 0.5);
    }
    // Normalize to [-1, 1] range approximately
    const scale = 2.0;
    x = Math.max(-1, Math.min(1, x * scale));
    y = Math.max(-1, Math.min(1, y * scale));
    return { x, y };
  }

  function computeConfidence(run) {
    const v = getAxesVector(run);
    // Confidence based on how far from center (0.5) the axes are + balance
    const deviation = v.reduce((s, a) => s + Math.abs(a - 0.5), 0) / 9;
    const bv = run.drift.balanceVector;
    const balance = 1 - Math.max(...bv.map(b => Math.abs(b - 1/3))) * 3;
    return Math.max(0.1, Math.min(1, (deviation * 0.6 + Math.max(0, balance) * 0.4) * 2));
  }

  function euclideanDist9D(a, b) {
    const va = getAxesVector(a), vb = getAxesVector(b);
    return Math.sqrt(va.reduce((s, v, i) => s + (v - vb[i]) ** 2, 0));
  }

  function findNeighbors(run, topN = 5) {
    return allRuns
      .filter(r => r.id !== run.id)
      .map(r => ({ id: r.id, utterance: r.utterance, distance: euclideanDist9D(run, r) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, topN);
  }

  // ─── Competition / Binding Forces ──────────────────────────
  function computeCompetition(run) {
    const axes = getAxesVector(run);
    const forces = [];

    // Abstraction Attractor: high epistemic + high scope
    if (axes[0] > 0.65 && axes[1] > 0.65) {
      forces.push({ type: 'abstraction', strength: (axes[0] + axes[1]) / 2, desc: 'High scope and epistemic stance pull toward abstraction.' });
    }
    // Constraint Trap: high rigidity + high density
    if (axes[3] > 0.65 && axes[4] > 0.65) {
      forces.push({ type: 'constraint', strength: (axes[3] + axes[4]) / 2, desc: 'High rigidity and constraint density create a constraint trap.' });
    }
    // Action Bias: high magnitude + high specificity
    if (axes[6] > 0.65 && axes[7] > 0.65) {
      forces.push({ type: 'action', strength: (axes[6] + axes[7]) / 2, desc: 'High magnitude and specificity bias toward immediate action.' });
    }
    // Authority-Epistemic Tension: high epistemic + high agency internal
    if (axes[1] > 0.6 && axes[2] > 0.6) {
      forces.push({ type: 'authority', strength: (axes[1] + axes[2]) / 2, desc: 'Axiomatic stance combined with internal agency creates authority tension.' });
    }
    // Scope-Agency Overreach: high scope + high agency
    if (axes[0] > 0.6 && axes[2] > 0.6 && axes[6] > 0.5) {
      forces.push({ type: 'scope_agency', strength: (axes[0] + axes[2] + axes[6]) / 3, desc: 'Universal scope with internal agency and force risks overreach.' });
    }
    // Temporal Binding: extreme temporal orientation (near 0 or 1) + high magnitude
    if ((axes[8] > 0.75 || axes[8] < 0.25) && axes[6] > 0.5) {
      forces.push({ type: 'temporal', strength: Math.abs(axes[8] - 0.5) + axes[6] / 2, desc: `Strong ${axes[8] > 0.5 ? 'prospective' : 'retrospective'} orientation with force creates temporal binding.` });
    }
    // Neighbor Gravity: if has close neighbors
    const neighbors = run.neighbors || [];
    if (neighbors.length && neighbors[0].distance < 0.5) {
      forces.push({ type: 'neighbor', strength: 1 - neighbors[0].distance, desc: `Close neighbor "${neighbors[0].utterance.slice(0, 40)}..." exerts gravitational pull.` });
    }

    // Fallback: guarantee ≥ 3 forces from Canon balance weights
    if (forces.length < 3) {
      const bv = run.drift.balanceVector;
      const roles = ['Frame', 'Gradient', 'Vector'];
      const roleForces = bv.map((w, i) => ({ role: roles[i], weight: w })).sort((a, b) => b.weight - a.weight);
      for (const rf of roleForces) {
        if (forces.length >= 3) break;
        const exists = forces.some(f =>
          (rf.role === 'Frame' && f.type === 'abstraction') ||
          (rf.role === 'Gradient' && f.type === 'constraint') ||
          (rf.role === 'Vector' && f.type === 'action'));
        if (!exists) {
          forces.push({
            type: rf.role === 'Frame' ? 'abstraction' : rf.role === 'Gradient' ? 'constraint' : 'action',
            strength: rf.weight,
            desc: `${rf.role} role weight (${(rf.weight * 100).toFixed(0)}%) contributes ambient ${rf.role.toLowerCase()} force.`
          });
        }
      }
    }

    return forces;
  }

  // ─── Run Coordinate + Field Display ─────────────────────────
  function runCoordinateAndField() {
    const coord = computeCoordinate(currentRun);
    currentRun.coordinate.x = coord.x;
    currentRun.coordinate.y = coord.y;
    currentRun.coordinate.confidence = computeConfidence(currentRun);

    currentRun.neighbors = findNeighbors(currentRun);
    currentRun.competition = computeCompetition(currentRun);

    renderCoordinateStep();
    updateFieldInfoBar();
    renderFieldCard();
    if (fieldRenderer) fieldRenderer.draw();
  }

  function renderCoordinateStep() {
    const c = currentRun.coordinate;
    const q = getQuadrant(c.x, c.y);
    document.getElementById('coordResults').innerHTML = `
      <div class="drift-report">
        <h4>Semantic Coordinate</h4>
        <p style="font-size:20px;font-weight:700;margin:8px 0;font-variant-numeric:tabular-nums">
          (${c.x.toFixed(3)}, ${c.y.toFixed(3)})
        </p>
        <p style="font-size:12px;color:var(--text-muted)">
          Quadrant: <strong style="color:${q.color}">${q.label}</strong> | Confidence: ${(c.confidence * 100).toFixed(0)}%
        </p>
      </div>`;

    const cards = document.getElementById('neighborCompCards');
    let nHtml = '<div class="info-card"><h4>Nearest Neighbors</h4>';
    if (currentRun.neighbors.length) {
      nHtml += '<ul>' + currentRun.neighbors.map(n =>
        `<li>"${escHtml(n.utterance.slice(0, 50))}${n.utterance.length > 50 ? '...' : ''}" <span style="color:var(--text-muted);float:right">d=${n.distance.toFixed(3)}</span></li>`
      ).join('') + '</ul>';
    } else {
      nHtml += '<p style="font-size:12px;color:var(--text-muted)">No other runs to compare.</p>';
    }
    nHtml += '</div>';

    let cHtml = '<div class="info-card"><h4>Binding Forces</h4><ul>';
    for (const f of currentRun.competition) {
      const ft = FORCE_TYPES.find(t => t.id === f.type) || { name: f.type, color: '#8b949e' };
      cHtml += `<li><span class="force-tag" style="background:${ft.color}33;color:${ft.color}">${ft.name}</span> ${(f.strength * 100).toFixed(0)}%</li>`;
    }
    cHtml += '</ul></div>';
    cards.innerHTML = nHtml + cHtml;
  }

  function getQuadrant(x, y) {
    if (x >= 0 && y >= 0) return QUADRANT_LABELS[0];
    if (x < 0 && y >= 0) return QUADRANT_LABELS[1];
    if (x < 0 && y < 0) return QUADRANT_LABELS[2];
    return QUADRANT_LABELS[3];
  }

  function updateFieldInfoBar() {
    const c = currentRun ? currentRun.coordinate : null;
    document.getElementById('infoCoord').textContent = c ? `Coordinate: (${c.x.toFixed(3)}, ${c.y.toFixed(3)})` : 'Coordinate: --';
    document.getElementById('infoQuadrant').textContent = c ? `Quadrant: ${getQuadrant(c.x, c.y).label}` : 'Quadrant: --';
  }

  // ─── Field Card Markdown ────────────────────────────────────
  function generateMarkdown(run) {
    const q = getQuadrant(run.coordinate.x, run.coordinate.y);
    let md = `# Field Card: ${run.utterance.slice(0, 80)}\n`;
    md += `**ID:** ${run.id}\n`;
    md += `**Timestamp:** ${run.timestamp}\n`;
    md += `**Domain:** ${run.domainTags.join(', ') || 'untagged'}\n`;
    md += `**Audience:** ${run.audience || 'unspecified'}\n`;
    md += `**Stakes:** ${run.stakes}\n\n`;

    md += `## Frame\n`;
    md += `- Observer: ${run.frame.observerRole}\n`;
    md += `- Scope: ${run.frame.contextScope}\n`;
    md += `- Basis: ${run.frame.measurementBasis}\n`;
    md += `- Sentence: ${run.frame.sentence}\n`;
    md += `- Axes: Scope=${run.frame.axes.scopeSpan}, Epistemic=${run.frame.axes.epistemicStance}, Agency=${run.frame.axes.agencyLocus}\n\n`;

    md += `## Gradient\n`;
    md += `- Invariants: ${run.gradient.invariants.join('; ') || 'none'}\n`;
    md += `- Boundaries: ${run.gradient.boundaryConditions.join('; ') || 'none'}\n`;
    md += `- Cost Surface: ${run.gradient.costSurface}\n`;
    md += `- Constraints: ${run.gradient.constraints.join('; ') || 'none'}\n`;
    md += `- Axes: Rigidity=${run.gradient.axes.rigidity}, Density=${run.gradient.axes.constraintDensity}, Reversibility=${run.gradient.axes.reversibility}\n\n`;

    md += `## Vector\n`;
    md += `- Intent: ${run.vector.intent}\n`;
    md += `- Action: ${run.vector.actionType}\n`;
    md += `- Targets: ${run.vector.targetVariables.join('; ') || 'none'}\n`;
    md += `- Arrow: ${run.vector.arrowDescriptor}\n`;
    md += `- Axes: Magnitude=${run.vector.axes.magnitude}, Specificity=${run.vector.axes.specificity}, Temporal=${run.vector.axes.temporalOrientation}\n\n`;

    md += `## Drift Check\n`;
    md += `- Risk: ${run.drift.riskLevel}\n`;
    md += `- Balance: Frame=${(run.drift.balanceVector[0]*100).toFixed(0)}% Gradient=${(run.drift.balanceVector[1]*100).toFixed(0)}% Vector=${(run.drift.balanceVector[2]*100).toFixed(0)}%\n`;
    if (run.drift.overdominanceRole) md += `- Overdominance: ${run.drift.overdominanceRole}\n`;
    if (run.drift.roleCollapseDetected) md += `- Collapse: ${run.drift.collapseType}\n`;
    if (run.drift.nonCommutativityFlag) md += `- Non-commutativity detected\n`;
    md += `- Report: ${run.drift.report}\n\n`;

    md += `## Coordinate\n`;
    md += `- Position: (${run.coordinate.x.toFixed(3)}, ${run.coordinate.y.toFixed(3)})\n`;
    md += `- Quadrant: ${q.label}\n`;
    md += `- Confidence: ${(run.coordinate.confidence * 100).toFixed(0)}%\n\n`;

    if (run.neighbors.length) {
      md += `## Neighbors\n`;
      for (const n of run.neighbors) {
        md += `- "${n.utterance.slice(0, 60)}" (d=${n.distance.toFixed(3)})\n`;
      }
      md += '\n';
    }

    if (run.competition.length) {
      md += `## Binding Forces\n`;
      for (const f of run.competition) {
        const ft = FORCE_TYPES.find(t => t.id === f.type);
        md += `- **${ft ? ft.name : f.type}** (${(f.strength * 100).toFixed(0)}%): ${f.desc}\n`;
      }
      md += '\n';
    }

    if (run.notes) md += `## Notes\n${run.notes}\n`;
    return md;
  }

  function renderFieldCard() {
    if (!currentRun) return;
    document.getElementById('fieldCardPreview').textContent = generateMarkdown(currentRun);
    const drawer = document.getElementById('bottomDrawer');
    drawer.classList.remove('collapsed');
  }

  // ─── Field Renderer (Canvas) ────────────────────────────────
  class FieldRendererClass {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.offsetX = 0;
      this.offsetY = 0;
      this.zoom = 1;
      this.dragging = false;
      this.dragStart = { x: 0, y: 0 };
      this.hoveredRun = null;
      this.setupEvents();
      this.resize();
    }

    resize() {
      const r = this.canvas.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = r.width * dpr;
      this.canvas.height = r.height * dpr;
      this.canvas.style.width = r.width + 'px';
      this.canvas.style.height = r.height + 'px';
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.w = r.width;
      this.h = r.height;
      this.draw();
    }

    toScreen(fx, fy) {
      const cx = this.w / 2 + this.offsetX;
      const cy = this.h / 2 + this.offsetY;
      const scale = Math.min(this.w, this.h) * 0.4 * this.zoom;
      return { x: cx + fx * scale, y: cy - fy * scale };
    }

    toField(sx, sy) {
      const cx = this.w / 2 + this.offsetX;
      const cy = this.h / 2 + this.offsetY;
      const scale = Math.min(this.w, this.h) * 0.4 * this.zoom;
      return { x: (sx - cx) / scale, y: -(sy - cy) / scale };
    }

    setupEvents() {
      this.canvas.addEventListener('mousedown', e => {
        this.dragging = true;
        this.dragStart = { x: e.clientX - this.offsetX, y: e.clientY - this.offsetY };
      });
      window.addEventListener('mousemove', e => {
        if (this.dragging) {
          this.offsetX = e.clientX - this.dragStart.x;
          this.offsetY = e.clientY - this.dragStart.y;
          this.draw();
          return;
        }
        // Hover detection
        const rect = this.canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left, my = e.clientY - rect.top;
        const tooltip = document.getElementById('canvasTooltip');
        let found = null;
        for (const run of allRuns) {
          const sp = this.toScreen(run.coordinate.x, run.coordinate.y);
          if (Math.hypot(sp.x - mx, sp.y - my) < 10) { found = run; break; }
        }
        if (currentRun && currentStep >= 5) {
          const sp = this.toScreen(currentRun.coordinate.x, currentRun.coordinate.y);
          if (Math.hypot(sp.x - mx, sp.y - my) < 10) found = currentRun;
        }
        if (found) {
          tooltip.style.display = 'block';
          tooltip.style.left = (e.clientX + 12) + 'px';
          tooltip.style.top = (e.clientY + 12) + 'px';
          const q = getQuadrant(found.coordinate.x, found.coordinate.y);
          tooltip.innerHTML = `<strong>${escHtml(found.utterance.slice(0, 80))}</strong><br>
            (${found.coordinate.x.toFixed(3)}, ${found.coordinate.y.toFixed(3)}) — ${q.label}<br>
            <span style="color:var(--text-muted)">${found.domainTags.join(', ') || 'untagged'}</span>`;
          this.hoveredRun = found;
        } else {
          tooltip.style.display = 'none';
          this.hoveredRun = null;
        }
      });
      window.addEventListener('mouseup', () => { this.dragging = false; });
      this.canvas.addEventListener('wheel', e => {
        e.preventDefault();
        const factor = e.deltaY > 0 ? 0.9 : 1.1;
        this.zoom = Math.max(0.3, Math.min(5, this.zoom * factor));
        this.draw();
      }, { passive: false });
      this.canvas.addEventListener('click', e => {
        if (this.hoveredRun && this.hoveredRun.id !== (currentRun && currentRun.id)) {
          loadRunIntoWizard(this.hoveredRun);
        }
      });
      window.addEventListener('resize', () => this.resize());
    }

    draw() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.w, this.h);

      // Background
      ctx.fillStyle = '#0e1117';
      ctx.fillRect(0, 0, this.w, this.h);

      // Grid
      const center = this.toScreen(0, 0);
      ctx.strokeStyle = '#21262d';
      ctx.lineWidth = 1;
      const step = Math.min(this.w, this.h) * 0.1 * this.zoom;
      for (let i = -20; i <= 20; i++) {
        const gx = center.x + i * step;
        const gy = center.y + i * step;
        if (gx >= 0 && gx <= this.w) {
          ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, this.h); ctx.stroke();
        }
        if (gy >= 0 && gy <= this.h) {
          ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(this.w, gy); ctx.stroke();
        }
      }

      // Axes
      ctx.strokeStyle = '#30363d';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, center.y); ctx.lineTo(this.w, center.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(center.x, 0); ctx.lineTo(center.x, this.h); ctx.stroke();

      // Axis labels
      ctx.font = '11px -apple-system, sans-serif';
      ctx.fillStyle = '#8b949e';
      ctx.textAlign = 'center';
      ctx.fillText('Abstract →', this.w - 50, center.y - 8);
      ctx.fillText('← Concrete', 50, center.y - 8);
      ctx.save();
      ctx.translate(center.x + 12, 30);
      ctx.fillText('↑ Dynamic', 0, 0);
      ctx.restore();
      ctx.save();
      ctx.translate(center.x + 12, this.h - 15);
      ctx.fillText('↓ Static', 0, 0);
      ctx.restore();

      // Quadrant labels
      ctx.font = '12px -apple-system, sans-serif';
      ctx.globalAlpha = 0.3;
      for (const q of QUADRANT_LABELS) {
        const qp = this.toScreen(q.x * 0.7, q.y * 0.7);
        ctx.fillStyle = q.color;
        ctx.textAlign = 'center';
        ctx.fillText(q.label, qp.x, qp.y);
      }
      ctx.globalAlpha = 1;

      // Saved run points
      for (const run of allRuns) {
        this.drawPoint(run, false);
      }

      // Active run
      if (currentRun && currentStep >= 5) {
        // Neighbor lines
        for (const n of currentRun.neighbors) {
          const nr = allRuns.find(r => r.id === n.id);
          if (!nr) continue;
          const sp1 = this.toScreen(currentRun.coordinate.x, currentRun.coordinate.y);
          const sp2 = this.toScreen(nr.coordinate.x, nr.coordinate.y);
          ctx.strokeStyle = '#8b949e44';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.beginPath(); ctx.moveTo(sp1.x, sp1.y); ctx.lineTo(sp2.x, sp2.y); ctx.stroke();
          ctx.setLineDash([]);
        }

        // Force arrows
        this.drawForceArrows(currentRun);

        // Active point (on top)
        this.drawPoint(currentRun, true);
      }
    }

    drawPoint(run, isActive) {
      const sp = this.toScreen(run.coordinate.x, run.coordinate.y);
      const q = getQuadrant(run.coordinate.x, run.coordinate.y);
      const r = isActive ? 8 : 5;

      if (isActive) {
        // Glow
        ctx_radialGlow(this.ctx, sp.x, sp.y, 20, q.color);
      }

      this.ctx.beginPath();
      this.ctx.arc(sp.x, sp.y, r, 0, Math.PI * 2);
      this.ctx.fillStyle = isActive ? q.color : q.color + '99';
      this.ctx.fill();
      this.ctx.strokeStyle = isActive ? '#fff' : q.color;
      this.ctx.lineWidth = isActive ? 2 : 1;
      this.ctx.stroke();

      // Label
      if (isActive || this.zoom > 1.5) {
        this.ctx.font = '10px -apple-system, sans-serif';
        this.ctx.fillStyle = '#e6edf3';
        this.ctx.textAlign = 'left';
        const label = run.utterance.slice(0, 30) + (run.utterance.length > 30 ? '...' : '');
        this.ctx.fillText(label, sp.x + r + 4, sp.y + 3);
      }
    }

    drawForceArrows(run) {
      const sp = this.toScreen(run.coordinate.x, run.coordinate.y);
      const forces = run.competition || [];
      const angleStep = (Math.PI * 2) / Math.max(forces.length, 1);

      forces.forEach((f, i) => {
        const ft = FORCE_TYPES.find(t => t.id === f.type) || { color: '#8b949e' };
        const angle = -Math.PI / 2 + i * angleStep;
        const len = 20 + f.strength * 40;
        const ex = sp.x + Math.cos(angle) * len;
        const ey = sp.y + Math.sin(angle) * len;

        this.ctx.strokeStyle = ft.color + 'aa';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(sp.x, sp.y);
        this.ctx.lineTo(ex, ey);
        this.ctx.stroke();

        // Arrowhead
        const headLen = 8;
        const a = Math.atan2(ey - sp.y, ex - sp.x);
        this.ctx.beginPath();
        this.ctx.moveTo(ex, ey);
        this.ctx.lineTo(ex - headLen * Math.cos(a - 0.4), ey - headLen * Math.sin(a - 0.4));
        this.ctx.lineTo(ex - headLen * Math.cos(a + 0.4), ey - headLen * Math.sin(a + 0.4));
        this.ctx.closePath();
        this.ctx.fillStyle = ft.color + 'aa';
        this.ctx.fill();
      });
    }
  }

  function ctx_radialGlow(ctx, x, y, radius, color) {
    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, color + '44');
    grad.addColorStop(1, color + '00');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // ─── Load Run Into Wizard (read-only view) ─────────────────
  function loadRunIntoWizard(run) {
    currentRun = JSON.parse(JSON.stringify(run));
    populateWizardFields(run);
    goToStep(5);
    runCoordinateAndField();
  }

  function populateWizardFields(run) {
    document.getElementById('inUtterance').value = run.utterance;
    document.getElementById('inDomainTags').value = run.domainTags.join(', ');
    document.getElementById('inAudience').value = run.audience;
    document.getElementById('inStakes').value = run.stakes;

    document.getElementById('frameObserverRole').value = run.frame.observerRole;
    document.getElementById('frameContextScope').value = run.frame.contextScope;
    document.getElementById('frameMeasurementBasis').value = run.frame.measurementBasis;
    document.getElementById('frameSentence').value = run.frame.sentence;
    setSlider('axisScopeSpan', 'valScopeSpan', run.frame.axes.scopeSpan);
    setSlider('axisEpistemicStance', 'valEpistemicStance', run.frame.axes.epistemicStance);
    setSlider('axisAgencyLocus', 'valAgencyLocus', run.frame.axes.agencyLocus);

    populateList('invariantsList', run.gradient.invariants);
    populateList('boundaryList', run.gradient.boundaryConditions);
    document.getElementById('gradCostSurface').value = run.gradient.costSurface;
    populateList('constraintsList', run.gradient.constraints);
    setSlider('axisRigidity', 'valRigidity', run.gradient.axes.rigidity);
    setSlider('axisConstraintDensity', 'valConstraintDensity', run.gradient.axes.constraintDensity);
    setSlider('axisReversibility', 'valReversibility', run.gradient.axes.reversibility);

    document.getElementById('vecIntent').value = run.vector.intent;
    document.getElementById('vecActionType').value = run.vector.actionType;
    populateList('targetVarsList', run.vector.targetVariables);
    document.getElementById('vecArrowDesc').value = run.vector.arrowDescriptor;
    setSlider('axisMagnitude', 'valMagnitude', run.vector.axes.magnitude);
    setSlider('axisSpecificity', 'valSpecificity', run.vector.axes.specificity);
    setSlider('axisTemporalOrientation', 'valTemporalOrientation', run.vector.axes.temporalOrientation);

    document.getElementById('runNotes').value = run.notes || '';
  }

  function setSlider(sliderId, valueId, val) {
    document.getElementById(sliderId).value = val;
    document.getElementById(valueId).textContent = val.toFixed(2);
  }

  function populateList(listId, items) {
    const container = document.querySelector(`#${listId} .list-items`);
    container.innerHTML = '';
    for (const item of items) addListItem(listId, item);
  }

  // ─── Save Run ───────────────────────────────────────────────
  function saveCurrentRun() {
    if (!currentRun) return;
    currentRun.notes = document.getElementById('runNotes').value.trim();
    const idx = allRuns.findIndex(r => r.id === currentRun.id);
    if (idx >= 0) allRuns[idx] = JSON.parse(JSON.stringify(currentRun));
    else allRuns.push(JSON.parse(JSON.stringify(currentRun)));
    saveRuns();
    if (fieldRenderer) fieldRenderer.draw();
  }

  // ─── Export / Import ────────────────────────────────────────
  function exportAllJSON() {
    downloadFile('semantic-physics-map-export.json', JSON.stringify(allRuns, null, 2), 'application/json');
  }

  function exportRunJSON() {
    if (!currentRun) return;
    downloadFile(`field-card-${currentRun.id.slice(0, 8)}.json`, JSON.stringify(currentRun, null, 2), 'application/json');
  }

  function exportRunMarkdown() {
    if (!currentRun) return;
    downloadFile(`field-card-${currentRun.id.slice(0, 8)}.md`, generateMarkdown(currentRun), 'text/markdown');
  }

  function downloadFile(name, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function importJSON(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        const runs = Array.isArray(data) ? data : [data];
        let imported = 0;
        for (const run of runs) {
          if (!run.id || !run.utterance) continue;
          if (!allRuns.some(r => r.id === run.id)) {
            allRuns.push(run);
            imported++;
          }
        }
        saveRuns();
        if (fieldRenderer) fieldRenderer.draw();
        alert(`Imported ${imported} run(s). ${runs.length - imported} skipped (duplicates or invalid).`);
      } catch (e) {
        alert('Invalid JSON file: ' + e.message);
      }
    };
    reader.readAsText(file);
  }

  // ─── Library ────────────────────────────────────────────────
  let librarySelection = null;

  function openLibrary() {
    librarySelection = null;
    renderLibraryList();
    document.getElementById('libraryModal').classList.add('open');
  }

  function renderLibraryList(filter = '') {
    const el = document.getElementById('libList');
    const f = filter.toLowerCase();
    const filtered = allRuns.filter(r =>
      !f || r.utterance.toLowerCase().includes(f) || r.domainTags.some(t => t.toLowerCase().includes(f))
    );
    el.innerHTML = filtered.length ? filtered.map(r => `
      <div class="lib-item ${librarySelection === r.id ? 'selected' : ''}" data-id="${r.id}">
        <div>
          <div class="lib-item-title">${escHtml(r.utterance.slice(0, 60))}${r.utterance.length > 60 ? '...' : ''}</div>
          <div class="lib-item-meta">${r.domainTags.join(', ')} | ${new Date(r.timestamp).toLocaleDateString()} | (${r.coordinate.x.toFixed(2)}, ${r.coordinate.y.toFixed(2)})</div>
        </div>
      </div>
    `).join('') : '<p style="color:var(--text-muted);font-size:12px">No runs found.</p>';

    el.querySelectorAll('.lib-item').forEach(item => {
      item.addEventListener('click', () => {
        librarySelection = item.dataset.id;
        el.querySelectorAll('.lib-item').forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
      });
    });
  }

  // ─── Compare ────────────────────────────────────────────────
  function openCompare() {
    compareSelection = [];
    renderCompareList();
    document.getElementById('compareDiff').innerHTML = '';
    document.getElementById('compareModal').classList.add('open');
  }

  function renderCompareList() {
    const el = document.getElementById('compareList');
    el.innerHTML = allRuns.map(r => `
      <div class="lib-item ${compareSelection.includes(r.id) ? 'selected' : ''}" data-id="${r.id}">
        <div>
          <div class="lib-item-title">${escHtml(r.utterance.slice(0, 60))}</div>
          <div class="lib-item-meta">(${r.coordinate.x.toFixed(2)}, ${r.coordinate.y.toFixed(2)}) | ${r.domainTags.join(', ')}</div>
        </div>
      </div>
    `).join('') || '<p style="color:var(--text-muted);font-size:12px">No runs to compare.</p>';

    el.querySelectorAll('.lib-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;
        if (compareSelection.includes(id)) {
          compareSelection = compareSelection.filter(i => i !== id);
        } else if (compareSelection.length < 2) {
          compareSelection.push(id);
        }
        renderCompareList();
      });
    });
  }

  function runCompare() {
    if (compareSelection.length !== 2) { alert('Select exactly 2 runs.'); return; }
    const a = allRuns.find(r => r.id === compareSelection[0]);
    const b = allRuns.find(r => r.id === compareSelection[1]);
    if (!a || !b) return;
    const el = document.getElementById('compareDiff');

    const diff = (label, va, vb) => {
      const same = va === vb;
      return `<tr><td style="color:var(--text-muted)">${label}</td><td class="${same ? '' : 'diff-highlight'}">${escHtml(String(va))}</td><td class="${same ? '' : 'diff-highlight'}">${escHtml(String(vb))}</td></tr>`;
    };

    const axA = getAxesVector(a), axB = getAxesVector(b);
    const dist = euclideanDist9D(a, b);

    el.innerHTML = `
      <p style="font-size:12px;margin-bottom:8px">9D Euclidean distance: <strong>${dist.toFixed(4)}</strong></p>
      <div class="compare-grid">
        <div class="compare-col">
          <h4>Run A</h4>
          <p style="font-size:12px">"${escHtml(a.utterance.slice(0, 80))}"</p>
          <p style="font-size:11px;color:var(--text-muted)">(${a.coordinate.x.toFixed(3)}, ${a.coordinate.y.toFixed(3)}) — ${getQuadrant(a.coordinate.x, a.coordinate.y).label}</p>
        </div>
        <div class="compare-col">
          <h4>Run B</h4>
          <p style="font-size:12px">"${escHtml(b.utterance.slice(0, 80))}"</p>
          <p style="font-size:11px;color:var(--text-muted)">(${b.coordinate.x.toFixed(3)}, ${b.coordinate.y.toFixed(3)}) — ${getQuadrant(b.coordinate.x, b.coordinate.y).label}</p>
        </div>
      </div>
      <table style="width:100%;font-size:12px;margin-top:12px;border-collapse:collapse">
        <tr style="border-bottom:1px solid var(--border)"><th style="text-align:left;padding:4px">Axis</th><th style="padding:4px">A</th><th style="padding:4px">B</th></tr>
        ${AXIS_KEYS.map((k, i) => diff(k, axA[i].toFixed(2), axB[i].toFixed(2))).join('')}
        ${diff('Risk Level', a.drift.riskLevel, b.drift.riskLevel)}
        ${diff('Quadrant', getQuadrant(a.coordinate.x, a.coordinate.y).label, getQuadrant(b.coordinate.x, b.coordinate.y).label)}
      </table>`;
  }

  // ─── Utility ────────────────────────────────────────────────
  function escHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function closeModal(id) {
    document.getElementById(id).classList.remove('open');
  }

  // ─── New Run ────────────────────────────────────────────────
  function startNewRun() {
    currentRun = createRun();
    currentStep = 0;

    // Clear form
    document.getElementById('inUtterance').value = '';
    document.getElementById('inDomainTags').value = '';
    document.getElementById('inAudience').value = '';
    document.getElementById('inStakes').value = 'medium';
    document.getElementById('frameObserverRole').value = '';
    document.getElementById('frameContextScope').value = '';
    document.getElementById('frameMeasurementBasis').value = '';
    document.getElementById('frameSentence').value = '';
    ['axisScopeSpan', 'axisEpistemicStance', 'axisAgencyLocus',
     'axisRigidity', 'axisConstraintDensity', 'axisReversibility',
     'axisMagnitude', 'axisSpecificity', 'axisTemporalOrientation'].forEach(id => {
      document.getElementById(id).value = 0.5;
    });
    ['valScopeSpan', 'valEpistemicStance', 'valAgencyLocus',
     'valRigidity', 'valConstraintDensity', 'valReversibility',
     'valMagnitude', 'valSpecificity', 'valTemporalOrientation'].forEach(id => {
      document.getElementById(id).textContent = '0.50';
    });
    document.getElementById('gradCostSurface').value = '';
    document.getElementById('vecIntent').value = '';
    document.getElementById('vecActionType').value = 'assert';
    document.getElementById('vecArrowDesc').value = '';
    document.getElementById('runNotes').value = '';
    ['invariantsList', 'boundaryList', 'constraintsList', 'targetVarsList'].forEach(id => {
      document.querySelector(`#${id} .list-items`).innerHTML = '';
    });
    document.getElementById('driftResults').innerHTML = '';
    document.getElementById('coordResults').innerHTML = '';
    document.getElementById('neighborCompCards').innerHTML = '';
    document.getElementById('fieldCardPreview').textContent = 'Complete a run to see the Field Card preview.';
    document.getElementById('bottomDrawer').classList.add('collapsed');

    goToStep(0);
  }

  // ─── Init ───────────────────────────────────────────────────
  function init() {
    loadRuns();

    // Wizard buttons
    document.getElementById('btnNextInput').addEventListener('click', () => {
      if (collectInput()) goToStep(1);
    });
    document.getElementById('btnBackFrame').addEventListener('click', () => goToStep(0));
    document.getElementById('btnNextFrame').addEventListener('click', () => {
      if (collectFrame()) goToStep(2);
    });
    document.getElementById('btnBackGrad').addEventListener('click', () => goToStep(1));
    document.getElementById('btnNextGrad').addEventListener('click', () => {
      if (collectGradient()) goToStep(3);
    });
    document.getElementById('btnBackVec').addEventListener('click', () => goToStep(2));
    document.getElementById('btnNextVec').addEventListener('click', () => {
      if (collectVector()) goToStep(4);
    });
    document.getElementById('btnBackDrift').addEventListener('click', () => goToStep(3));
    document.getElementById('btnAcceptDrift').addEventListener('click', () => goToStep(5));

    // Coordinate step buttons
    document.getElementById('btnSaveRun').addEventListener('click', () => {
      saveCurrentRun();
      alert('Field Card saved.');
    });
    document.getElementById('btnExportMD').addEventListener('click', exportRunMarkdown);
    document.getElementById('btnExportJSON').addEventListener('click', exportRunJSON);

    // Header buttons
    document.getElementById('btnNewRun').addEventListener('click', startNewRun);
    document.getElementById('btnLibrary').addEventListener('click', openLibrary);
    document.getElementById('btnCompare').addEventListener('click', openCompare);
    document.getElementById('btnExportAll').addEventListener('click', exportAllJSON);
    document.getElementById('btnImport').addEventListener('click', () => document.getElementById('importFile').click());
    document.getElementById('importFile').addEventListener('change', e => {
      if (e.target.files[0]) importJSON(e.target.files[0]);
      e.target.value = '';
    });

    // Library modal
    document.getElementById('libSearch').addEventListener('input', e => renderLibraryList(e.target.value));
    document.getElementById('btnLoadSelected').addEventListener('click', () => {
      if (!librarySelection) return;
      const run = allRuns.find(r => r.id === librarySelection);
      if (run) { loadRunIntoWizard(run); closeModal('libraryModal'); }
    });
    document.getElementById('btnDeleteSelected').addEventListener('click', () => {
      if (!librarySelection) return;
      if (!confirm('Delete this run permanently?')) return;
      allRuns = allRuns.filter(r => r.id !== librarySelection);
      librarySelection = null;
      saveRuns();
      renderLibraryList(document.getElementById('libSearch').value);
      if (fieldRenderer) fieldRenderer.draw();
    });

    // Compare modal
    document.getElementById('btnRunCompare').addEventListener('click', runCompare);

    // Slider live update
    document.querySelectorAll('input[type="range"]').forEach(slider => {
      const valId = 'val' + slider.id.replace('axis', '');
      slider.addEventListener('input', () => {
        const valEl = document.getElementById(valId);
        if (valEl) valEl.textContent = parseFloat(slider.value).toFixed(2);
      });
    });

    // Drawer toggle
    document.getElementById('drawerToggle').addEventListener('click', () => {
      document.getElementById('bottomDrawer').classList.toggle('collapsed');
    });

    // Keyboard navigation
    document.addEventListener('keydown', e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        // Advance step if possible
        const nextBtn = document.querySelector(`.wizard-step.active .btn-primary`);
        if (nextBtn && !nextBtn.disabled) nextBtn.click();
      }
      if (e.key === 'ArrowLeft') {
        const backBtn = document.querySelector(`.wizard-step.active .btn:not(.btn-primary)`);
        if (backBtn) backBtn.click();
      }
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey) startNewRun();
    });

    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', e => {
        if (e.target === overlay) overlay.classList.remove('open');
      });
    });

    // Canvas
    fieldRenderer = new FieldRendererClass(document.getElementById('fieldCanvas'));

    // Start fresh
    currentRun = createRun();
    updateStepIndicator();
    updateStorageInfo();
  }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API for inline onclick handlers
  return { addListItem, closeModal };
})();
