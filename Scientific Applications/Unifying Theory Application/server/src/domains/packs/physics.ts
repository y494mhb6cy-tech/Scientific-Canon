/**
 * Built-in domain pack: Physics
 */

import type { DomainPack } from '../../types/domain.types.js';
import { createDomainPack } from '../domain-pack.js';

const physics: DomainPack = createDomainPack({
  id: 'physics',
  name: 'Physics',
  description:
    'Classical and modern physics — forces, conservation laws, spacetime, and thermodynamics.',
  concepts: [
    {
      name: 'Reference Frame',
      description:
        'A coordinate system or observational standpoint from which measurements are made. All physical quantities are frame-dependent until proven invariant.',
      suggestedRole: 'Frame',
    },
    {
      name: 'Spacetime',
      description:
        'The four-dimensional manifold unifying space and time, providing the stage on which all physical events occur.',
      suggestedRole: 'Frame',
    },
    {
      name: 'Conservation Law',
      description:
        'A principle stating that a measurable quantity (energy, momentum, charge) remains constant within an isolated system over time.',
      suggestedRole: 'Gradient',
    },
    {
      name: 'Entropy Gradient',
      description:
        'The thermodynamic tendency of systems to evolve toward states of higher entropy, constraining the direction of spontaneous change.',
      suggestedRole: 'Gradient',
    },
    {
      name: 'Force / Acceleration',
      description:
        'An interaction that changes the state of motion of an object. Force acts as the causal vector producing acceleration.',
      suggestedRole: 'Vector',
    },
    {
      name: 'Momentum',
      description:
        'The product of mass and velocity; a directed quantity representing an object\'s tendency to continue moving in a given direction.',
      suggestedRole: 'Vector',
    },
  ],
  exampleInvariants: [
    'Energy is conserved in closed systems.',
    'For every action there is an equal and opposite reaction.',
    'The speed of light in vacuum is the same in all inertial reference frames.',
  ],
});

export default physics;
