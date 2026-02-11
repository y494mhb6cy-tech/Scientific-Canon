/**
 * Built-in domain pack: Economics
 */

import type { DomainPack } from '../../types/domain.types.js';
import { createDomainPack } from '../domain-pack.js';

const economics: DomainPack = createDomainPack({
  id: 'economics',
  name: 'Economics',
  description:
    'Economic theory — markets, institutions, incentive structures, and the constraints governing resource allocation.',
  concepts: [
    {
      name: 'Market Scope',
      description:
        'The boundaries defining a particular market — its participants, goods, geography, and time horizon — establishing the frame of analysis.',
      suggestedRole: 'Frame',
    },
    {
      name: 'Institutional Framework',
      description:
        'The legal, cultural, and organizational structures within which economic activity takes place, framing what transactions are possible.',
      suggestedRole: 'Frame',
    },
    {
      name: 'Regulatory Constraint / Supply Curve',
      description:
        'External rules and cost structures that constrain production and exchange, shaping the gradient of feasible outcomes.',
      suggestedRole: 'Gradient',
    },
    {
      name: 'Price Mechanism',
      description:
        'The signaling system through which supply and demand information propagates, constraining allocation through continuous feedback.',
      suggestedRole: 'Gradient',
    },
    {
      name: 'Transaction / Capital Flow',
      description:
        'A directed exchange of value between agents, the elementary vector of economic activity.',
      suggestedRole: 'Vector',
    },
    {
      name: 'Investment Decision',
      description:
        'A forward-looking commitment of resources toward expected future return — the vector bridging present constraint and future possibility.',
      suggestedRole: 'Vector',
    },
  ],
  exampleInvariants: [
    'Markets require both constraint and agency.',
    'No transaction occurs outside an institutional frame.',
    'Prices encode information that no single agent fully possesses.',
  ],
});

export default economics;
