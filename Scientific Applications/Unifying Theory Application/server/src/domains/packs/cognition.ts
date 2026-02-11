/**
 * Built-in domain pack: Cognition
 */

import type { DomainPack } from '../../types/domain.types.js';
import { createDomainPack } from '../domain-pack.js';

const cognition: DomainPack = createDomainPack({
  id: 'cognition',
  name: 'Cognition',
  description:
    'Human cognition — perception, reasoning, decision-making, and the biases that shape thought.',
  concepts: [
    {
      name: 'Perspective / Worldview',
      description:
        'The mental frame through which an agent interprets sensory data and assigns meaning. It determines what counts as salient.',
      suggestedRole: 'Frame',
    },
    {
      name: 'Attention Scope',
      description:
        'The bounded window of awareness an agent can maintain at any moment, acting as a selective frame over the information landscape.',
      suggestedRole: 'Frame',
    },
    {
      name: 'Cognitive Bias / Heuristic',
      description:
        'Systematic deviations from normative reasoning that constrain inference, functioning as gradients that channel thought along predictable paths.',
      suggestedRole: 'Gradient',
    },
    {
      name: 'Bayesian Prior',
      description:
        'A pre-existing probability distribution encoding prior belief, which constrains how new evidence is interpreted and integrated.',
      suggestedRole: 'Gradient',
    },
    {
      name: 'Decision / Inference',
      description:
        'A directed cognitive act that moves an agent from uncertainty to commitment, producing observable behavioral change.',
      suggestedRole: 'Vector',
    },
    {
      name: 'Motor Output',
      description:
        'The final effector signal translating cognitive intent into physical action — the vector that crosses from mind to world.',
      suggestedRole: 'Vector',
    },
  ],
  exampleInvariants: [
    'Perception is constrained by prior expectation.',
    'All inference requires a frame of reference.',
    'Attention is a finite resource that bounds cognitive throughput.',
  ],
});

export default cognition;
