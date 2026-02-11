/**
 * Built-in domain pack: Systems Design
 */

import type { DomainPack } from '../../types/domain.types.js';
import { createDomainPack } from '../domain-pack.js';

const systemsDesign: DomainPack = createDomainPack({
  id: 'systems-design',
  name: 'Systems Design',
  description:
    'Software and systems architecture — boundaries, constraints, data flow, and the principles governing reliable distributed systems.',
  concepts: [
    {
      name: 'System Boundary',
      description:
        'The demarcation separating a system from its environment, defining what is internal (controllable) versus external (observable).',
      suggestedRole: 'Frame',
    },
    {
      name: 'Architectural Scope',
      description:
        'The extent of responsibility a component or service owns, establishing the frame within which design decisions are coherent.',
      suggestedRole: 'Frame',
    },
    {
      name: 'Design Constraint / SLA',
      description:
        'Explicit bounds on latency, throughput, availability, or correctness that constrain the solution space and shape trade-offs.',
      suggestedRole: 'Gradient',
    },
    {
      name: 'Consistency Model',
      description:
        'The guarantees a system provides about the ordering and visibility of operations, constraining how components may interact.',
      suggestedRole: 'Gradient',
    },
    {
      name: 'Data Flow / Request',
      description:
        'A directed movement of information or intent through the system, carrying state changes from origin to destination.',
      suggestedRole: 'Vector',
    },
    {
      name: 'Event Propagation',
      description:
        'The mechanism by which state changes are broadcast across system components, the vector of eventual consistency.',
      suggestedRole: 'Vector',
    },
  ],
  exampleInvariants: [
    'No system operates without boundary conditions.',
    'Reliability requires explicit constraint acknowledgment.',
    'Distribution introduces latency, partial failure, and ordering ambiguity.',
  ],
});

export default systemsDesign;
