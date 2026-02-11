// Edges connecting idea nodes
// type: 'parent' = region→child, 'sibling' = within region, 'cross' = between regions

const edgeDefs = [
  // Frame parent edges
  ['frame-boundary', 'boundary', 'standpoint', 'sibling'],
  ['frame-scope', 'standpoint', 'scope', 'sibling'],
  ['frame-identity', 'boundary', 'identity', 'sibling'],
  ['frame-incexc', 'identity', 'inclusion-exclusion', 'sibling'],

  // Frame depth-2
  ['frame-perm', 'boundary', 'permeability', 'parent'],
  ['frame-obs', 'standpoint', 'observer', 'parent'],
  ['frame-ctx', 'scope', 'context', 'parent'],

  // Gradient parent edges
  ['grad-rule', 'constraint', 'rule', 'sibling'],
  ['grad-inv', 'rule', 'invariant', 'sibling'],
  ['grad-cont', 'constraint', 'continuity', 'sibling'],
  ['grad-meas', 'continuity', 'measure', 'sibling'],

  // Gradient depth-2
  ['grad-sym', 'constraint', 'symmetry-breaking', 'parent'],
  ['grad-cons', 'invariant', 'conservation', 'parent'],
  ['grad-thresh', 'continuity', 'threshold', 'parent'],

  // Vector parent edges
  ['vec-dir', 'action', 'direction', 'sibling'],
  ['vec-force', 'direction', 'force', 'sibling'],
  ['vec-desire', 'action', 'desire', 'sibling'],
  ['vec-mom', 'desire', 'momentum', 'sibling'],

  // Vector depth-2
  ['vec-intent', 'action', 'intention', 'parent'],
  ['vec-resist', 'force', 'resistance', 'parent'],
  ['vec-flow', 'momentum', 'flow', 'parent'],

  // Cross-cutting connections
  ['cross-bal-frame', 'identity', 'balance', 'cross'],
  ['cross-bal-grad', 'invariant', 'balance', 'cross'],
  ['cross-bal-vec', 'momentum', 'balance', 'cross'],

  ['cross-col-frame', 'inclusion-exclusion', 'collapse', 'cross'],
  ['cross-col-grad', 'constraint', 'collapse', 'cross'],
  ['cross-col-vec', 'force', 'collapse', 'cross'],

  ['cross-coh-frame', 'scope', 'coherence', 'cross'],
  ['cross-coh-grad', 'measure', 'coherence', 'cross'],
  ['cross-coh-vec', 'direction', 'coherence', 'cross'],

  // Balance ↔ Collapse ↔ Coherence
  ['cross-bal-col', 'balance', 'collapse', 'cross'],
  ['cross-bal-coh', 'balance', 'coherence', 'cross'],
];

const REGION_COLORS = {
  frame: '#4A6FA5',
  gradient: '#6B8F71',
  vector: '#C4775B',
  cross: '#8B7EC8',
};

function getEdgeColor(type, sourceId) {
  if (type === 'cross') return REGION_COLORS.cross;
  // Infer region from source node
  const frameNodes = ['boundary', 'standpoint', 'scope', 'identity', 'inclusion-exclusion', 'permeability', 'observer', 'context'];
  const gradNodes = ['constraint', 'rule', 'invariant', 'continuity', 'measure', 'symmetry-breaking', 'conservation', 'threshold'];
  if (frameNodes.includes(sourceId)) return REGION_COLORS.frame;
  if (gradNodes.includes(sourceId)) return REGION_COLORS.gradient;
  return REGION_COLORS.vector;
}

export const flowEdges = edgeDefs.map(([id, source, target, type]) => ({
  id,
  source,
  target,
  type: 'default',
  animated: type === 'cross',
  style: {
    stroke: getEdgeColor(type, source),
    strokeWidth: type === 'cross' ? 1.5 : 2,
    opacity: type === 'parent' ? 0.5 : 0.7,
  },
}));

export default edgeDefs;
