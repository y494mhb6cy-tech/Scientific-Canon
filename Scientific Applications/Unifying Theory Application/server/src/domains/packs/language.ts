/**
 * Built-in domain pack: Language
 */

import type { DomainPack } from '../../types/domain.types.js';
import { createDomainPack } from '../domain-pack.js';

const language: DomainPack = createDomainPack({
  id: 'language',
  name: 'Language',
  description:
    'Natural language — syntax, semantics, pragmatics, and the structures that make communication possible.',
  concepts: [
    {
      name: 'Context / Register',
      description:
        'The situational and social frame within which an utterance is produced and interpreted, determining appropriate form and meaning.',
      suggestedRole: 'Frame',
    },
    {
      name: 'Semantic Frame',
      description:
        'A structured representation of a situation type (e.g., a commercial transaction) that organizes the roles and relationships participants can fill.',
      suggestedRole: 'Frame',
    },
    {
      name: 'Grammar / Syntax Rules',
      description:
        'The hierarchical constraints governing how words combine into well-formed sentences, shaping the space of expressible meanings.',
      suggestedRole: 'Gradient',
    },
    {
      name: 'Morphological Constraint',
      description:
        'Rules governing word-internal structure (inflection, derivation) that constrain how meaning is encoded at the sub-word level.',
      suggestedRole: 'Gradient',
    },
    {
      name: 'Speech Act / Utterance',
      description:
        'A directed communicative event that changes the shared discourse state — the vector carrying illocutionary force.',
      suggestedRole: 'Vector',
    },
    {
      name: 'Discourse Move',
      description:
        'A strategic step in a conversation or text that advances a communicative goal, such as asserting, questioning, or conceding.',
      suggestedRole: 'Vector',
    },
  ],
  exampleInvariants: [
    'Meaning requires both structure and context.',
    'All utterances operate within grammatical constraints.',
    'Communication presupposes shared frame between speaker and hearer.',
  ],
});

export default language;
