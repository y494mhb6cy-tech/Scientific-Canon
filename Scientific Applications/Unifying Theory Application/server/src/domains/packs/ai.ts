/**
 * Built-in domain pack: Artificial Intelligence
 */

import type { DomainPack } from '../../types/domain.types.js';
import { createDomainPack } from '../domain-pack.js';

const ai: DomainPack = createDomainPack({
  id: 'ai',
  name: 'Artificial Intelligence',
  description:
    'Machine learning and AI — training, optimization, representation, and the constraints that shape model behavior.',
  concepts: [
    {
      name: 'Training Distribution',
      description:
        'The statistical frame defined by the data a model has seen during training, bounding what the model can reliably represent.',
      suggestedRole: 'Frame',
    },
    {
      name: 'Embedding Space',
      description:
        'A learned continuous vector space in which inputs are represented, providing the geometric frame for similarity and analogy.',
      suggestedRole: 'Frame',
    },
    {
      name: 'Loss Function / Regularization',
      description:
        'The objective and penalty terms that constrain optimization, shaping the gradient landscape the model traverses during training.',
      suggestedRole: 'Gradient',
    },
    {
      name: 'Architectural Constraint',
      description:
        'Structural choices (depth, width, attention patterns) that impose inductive biases, constraining the hypothesis space the model explores.',
      suggestedRole: 'Gradient',
    },
    {
      name: 'Inference / Prediction',
      description:
        'A forward pass through a trained model producing an output — the directed vector from input representation to actionable decision.',
      suggestedRole: 'Vector',
    },
    {
      name: 'Gradient Descent Step',
      description:
        'A single parameter update in the direction of steepest loss reduction, the elemental vector of learning.',
      suggestedRole: 'Vector',
    },
  ],
  exampleInvariants: [
    'Model output is bounded by training distribution.',
    'Optimization requires both objective and constraint.',
    'Generalization degrades as input diverges from training support.',
  ],
});

export default ai;
