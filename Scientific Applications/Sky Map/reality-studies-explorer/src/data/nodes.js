// Seed nodes for Reality Studies Explorer
// Each node has: id, label, region, depth, oneLiner, description, position
const nodes = [
  // ── Frame (Ethos) — depth 1 ──────────────────────────────────
  {
    id: 'boundary',
    label: 'Boundary',
    region: 'frame',
    depth: 1,
    oneLiner: 'Where one thing ends and another begins.',
    description:
      'A boundary is the condition that separates inside from outside. Every frame presupposes a boundary — without it, there is no distinction, no identity, no perspective. Boundaries can be sharp or fuzzy, but they are never absent.',
    position: { x: -600, y: -100 },
  },
  {
    id: 'standpoint',
    label: 'Standpoint',
    region: 'frame',
    depth: 1,
    oneLiner: 'The position from which you observe.',
    description:
      'A standpoint is where you stand when you look at reality. It determines what you can see and what remains hidden. Every observation is made from somewhere — there is no view from nowhere.',
    position: { x: -300, y: -200 },
  },
  {
    id: 'scope',
    label: 'Scope',
    region: 'frame',
    depth: 1,
    oneLiner: 'How much of reality your frame includes.',
    description:
      'Scope defines the breadth of a frame — how much territory it covers. A narrow scope gives precision; a wide scope gives context. The art is choosing the right scope for the question at hand.',
    position: { x: 0, y: -100 },
  },
  {
    id: 'identity',
    label: 'Identity',
    region: 'frame',
    depth: 1,
    oneLiner: 'What persists when everything else changes.',
    description:
      'Identity is what makes something itself and not something else. It is the invariant core that a frame protects. Without identity, there is nothing to frame — the boundary would enclose emptiness.',
    position: { x: -450, y: 100 },
  },
  {
    id: 'inclusion-exclusion',
    label: 'Inclusion / Exclusion',
    region: 'frame',
    depth: 1,
    oneLiner: 'Every frame includes by excluding.',
    description:
      'To include is simultaneously to exclude. Every act of framing is a choice about what matters and what does not. This duality is the ethical core of the Frame — it demands responsibility for what is left out.',
    position: { x: -150, y: 200 },
  },

  // ── Frame depth 2 ────────────────────────────────────────────
  {
    id: 'permeability',
    label: 'Permeability',
    region: 'frame',
    depth: 2,
    oneLiner: 'How much a boundary lets through.',
    description:
      'Not all boundaries are walls. Permeability describes the degree to which a boundary allows exchange. A fully permeable boundary dissolves identity; a fully impermeable one starves it. Life exists in the middle.',
    position: { x: -700, y: 50 },
  },
  {
    id: 'observer',
    label: 'Observer',
    region: 'frame',
    depth: 2,
    oneLiner: 'The one who occupies the standpoint.',
    description:
      'The observer is not a passive receiver but an active participant. What you observe depends on who you are, what you bring, and what you are prepared to see. The observer is always inside the system.',
    position: { x: -200, y: -350 },
  },
  {
    id: 'context',
    label: 'Context',
    region: 'frame',
    depth: 2,
    oneLiner: 'The background that gives foreground meaning.',
    description:
      'Context is the larger frame within which a frame sits. Every scope exists within a wider scope. To understand something fully, you must understand what surrounds it — and what surrounds that.',
    position: { x: 100, y: 50 },
  },

  // ── Gradient (Logos) — depth 1 ────────────────────────────────
  {
    id: 'constraint',
    label: 'Constraint',
    region: 'gradient',
    depth: 1,
    oneLiner: 'What limits also defines.',
    description:
      'A constraint is a rule that restricts possibility. But far from being merely negative, constraints are generative — they create structure from chaos. Without constraint, there is no form, no pattern, no meaning.',
    position: { x: 800, y: -100 },
  },
  {
    id: 'rule',
    label: 'Rule',
    region: 'gradient',
    depth: 1,
    oneLiner: 'A repeatable pattern of constraint.',
    description:
      'A rule is a constraint that applies consistently. Rules are the grammar of reality — they tell you what can follow what. They create predictability, and predictability creates the possibility of knowledge.',
    position: { x: 1100, y: -200 },
  },
  {
    id: 'invariant',
    label: 'Invariant',
    region: 'gradient',
    depth: 1,
    oneLiner: 'What stays the same under transformation.',
    description:
      'An invariant is the quantity or quality that does not change even as everything around it transforms. Finding invariants is the deepest act of understanding — it reveals what is truly fundamental.',
    position: { x: 1400, y: -100 },
  },
  {
    id: 'continuity',
    label: 'Continuity',
    region: 'gradient',
    depth: 1,
    oneLiner: 'Change without rupture.',
    description:
      'Continuity means that small changes produce small effects. It is the assumption that makes gradients possible — without it, reality would be an incomprehensible patchwork of disconnected states.',
    position: { x: 950, y: 100 },
  },
  {
    id: 'measure',
    label: 'Measure',
    region: 'gradient',
    depth: 1,
    oneLiner: 'How we quantify difference.',
    description:
      'Measure assigns numbers to qualities, making comparison possible. It is the bridge between the qualitative and the quantitative — the tool that lets us say not just "different" but "how much different."',
    position: { x: 1250, y: 200 },
  },

  // ── Gradient depth 2 ─────────────────────────────────────────
  {
    id: 'symmetry-breaking',
    label: 'Symmetry Breaking',
    region: 'gradient',
    depth: 2,
    oneLiner: 'When uniformity gives way to structure.',
    description:
      'Symmetry breaking is the moment a gradient appears where none existed. It is the origin of difference — the process by which a featureless state develops structure, pattern, and information.',
    position: { x: 700, y: 50 },
  },
  {
    id: 'conservation',
    label: 'Conservation',
    region: 'gradient',
    depth: 2,
    oneLiner: 'What cannot be created or destroyed.',
    description:
      'Conservation laws are the deepest invariants — they tell us what the universe keeps constant across all transformations. Energy, momentum, charge: these are the non-negotiable bookkeeping rules of reality.',
    position: { x: 1500, y: 50 },
  },
  {
    id: 'threshold',
    label: 'Threshold',
    region: 'gradient',
    depth: 2,
    oneLiner: 'The point where quantity becomes quality.',
    description:
      'A threshold is where continuity breaks — where gradual change suddenly produces a qualitative shift. Water becomes ice. Patience becomes anger. Thresholds are where the gradient model meets its limit.',
    position: { x: 1100, y: 350 },
  },

  // ── Vector (Pathos) — depth 1 ─────────────────────────────────
  {
    id: 'action',
    label: 'Action',
    region: 'vector',
    depth: 1,
    oneLiner: 'The irreducible unit of change.',
    description:
      'Action is movement with consequence. It is the vector made real — the moment where potential becomes actual. Every action transforms the state of the world and cannot be undone, only followed by further action.',
    position: { x: 100, y: 1500 },
  },
  {
    id: 'direction',
    label: 'Direction',
    region: 'vector',
    depth: 1,
    oneLiner: 'Where the arrow points.',
    description:
      'Direction gives action its meaning. The same force applied in different directions produces entirely different outcomes. Direction is the qualitative aspect of the vector — it tells you not how much, but where.',
    position: { x: 400, y: 1400 },
  },
  {
    id: 'force',
    label: 'Force',
    region: 'vector',
    depth: 1,
    oneLiner: 'What causes change in motion.',
    description:
      'Force is the cause of acceleration — the reason things speed up, slow down, or change direction. In human terms, force is persuasion, compulsion, attraction, and repulsion. It is the engine of the vector.',
    position: { x: 700, y: 1500 },
  },
  {
    id: 'desire',
    label: 'Desire',
    region: 'vector',
    depth: 1,
    oneLiner: 'The pull toward what is not yet.',
    description:
      'Desire is the subjective experience of a vector — the felt sense of being drawn toward something. It is the emotional fuel of action, the reason anything moves at all. Without desire, the universe is inert.',
    position: { x: 250, y: 1700 },
  },
  {
    id: 'momentum',
    label: 'Momentum',
    region: 'vector',
    depth: 1,
    oneLiner: 'The tendency to continue.',
    description:
      'Momentum is the resistance of motion to change. Once something is moving, it takes force to stop or redirect it. Habits, institutions, cultures — all have momentum. Understanding momentum is understanding persistence.',
    position: { x: 550, y: 1800 },
  },

  // ── Vector depth 2 ───────────────────────────────────────────
  {
    id: 'intention',
    label: 'Intention',
    region: 'vector',
    depth: 2,
    oneLiner: 'Action aimed at an outcome.',
    description:
      'Intention is direction plus purpose. It transforms mere movement into meaningful action. Intention requires an agent — someone or something that can aim, plan, and evaluate whether the action achieved its goal.',
    position: { x: 0, y: 1350 },
  },
  {
    id: 'resistance',
    label: 'Resistance',
    region: 'vector',
    depth: 2,
    oneLiner: 'The force that opposes the vector.',
    description:
      'Resistance is what pushes back. Every action meets resistance — friction, opposition, inertia. Resistance is not the enemy of the vector but its necessary partner: without resistance, force has no meaning.',
    position: { x: 800, y: 1700 },
  },
  {
    id: 'flow',
    label: 'Flow',
    region: 'vector',
    depth: 2,
    oneLiner: 'When action and environment align.',
    description:
      'Flow is the state where desire, direction, and capacity converge. Resistance drops, momentum builds, and action becomes effortless. Flow is the vector at its most coherent — maximum movement, minimum waste.',
    position: { x: 450, y: 2000 },
  },

  // ── Cross-cutting nodes ──────────────────────────────────────
  {
    id: 'balance',
    label: 'Balance',
    region: 'cross',
    depth: 0,
    oneLiner: 'The equilibrium of all three.',
    description:
      'Balance is the state where Frame, Gradient, and Vector are in dynamic equilibrium. It is not stillness but harmony — each dimension active, none dominating. Balance is the aspiration of the Canon of Symmetry itself.',
    position: { x: 400, y: 600 },
  },
  {
    id: 'collapse',
    label: 'Collapse',
    region: 'cross',
    depth: 0,
    oneLiner: 'When one dimension overwhelms the others.',
    description:
      'Collapse is the failure of balance — when Frame rigidifies into dogma, Gradient reduces to mere calculation, or Vector degenerates into blind impulse. Recognizing collapse is the first step toward restoring symmetry.',
    position: { x: 100, y: 700 },
  },
  {
    id: 'coherence',
    label: 'Coherence',
    region: 'cross',
    depth: 0,
    oneLiner: 'When all parts reinforce each other.',
    description:
      'Coherence is the positive face of balance — the state where Frame, Gradient, and Vector are not merely coexisting but actively strengthening one another. A coherent system is more than the sum of its parts.',
    position: { x: 700, y: 700 },
  },
];

// Convert to React Flow format
export const flowNodes = nodes.map((n) => ({
  id: n.id,
  type: 'idea',
  position: n.position,
  data: {
    label: n.label,
    region: n.region,
    depth: n.depth,
    oneLiner: n.oneLiner,
    description: n.description,
  },
}));

export default nodes;
