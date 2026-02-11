# Recursion in Information Theory: A Primitive-Based Interpretation

## Title and Domain Context
In information theory, recursion appears in coding and decoding procedures, iterative estimation, and message-passing algorithms. The focus is often on how information is represented, transformed, and recovered under constraints such as channel capacity or code structure. Recursive processes here are typically operational: they describe how a decoder or estimator repeatedly applies a fixed rule to refine a representation until a stopping condition is reached.

## Primitive Translation Table
| Primitive | Domain-native term | Operational meaning in this domain |
| --- | --- | --- |
| State | Decoder state or partial message | The current representation of what has been decoded so far |
| Rule / Update Operator | Update rule | The step that refines the estimate or advances decoding |
| Boundary / Constraint | Code or channel constraints | Prefix conditions, capacity limits, or admissible symbol sets |
| Base Case / Termination Condition | Decode completion | A condition indicating that a symbol or message is fully decoded |
| Iteration / Self-Application | Iterative decoding | Repeated application of the same decoding or refinement rule |
| Observer / Representation | Encoded or decoded symbol view | The representation used to interpret progress and correctness |
| Invariant | Consistency property | A property that remains true across decoding steps (e.g., prefix correctness) |

## Law of Recursion (Domain Formulation)
A recursive information-processing procedure is lawful when it has a well-defined decoding state, a fixed update rule, explicit termination conditions, and iteration that moves the state toward completion under stated code and channel constraints. Under a stable representation, such a procedure exhibits predictable progression toward completion and structural self-similarity in its repeated steps. The claim is structural and does not assert optimality or capacity-achieving performance.

## Worked Domain Example
Example: decoding a prefix code by traversing a binary tree.

Primitive mapping in prefix-code decoding:
- State: the current node in the decoding tree and the remaining input bits.
- Rule / Update Operator: consume one bit and move to the left or right child accordingly.
- Boundary / Constraint: the tree is finite and prefix-free; bits are processed in order.
- Base Case / Termination Condition: reaching a leaf node yields a decoded symbol.
- Iteration / Self-Application: after outputting a symbol, the procedure restarts at the root with remaining bits.
- Observer / Representation: the output symbol sequence is the representation of the decoded message.
- Invariant: the prefix-free property ensures that no leaf is a prefix of another, preserving unambiguous decoding.

This recursion is lawful because each step consumes input and moves toward a leaf, and the invariant ensures correctness. The observer is the decoded symbol stream, which is interpreted as the recovered message. The boundary constraints ensure that each prefix corresponds to a unique path in the tree.

## Failure Modes (Domain-Specific)
Recursion fails in information theory when primitives are broken.

1. Missing base cases. If the decoding procedure has no recognizable completion condition, decoding does not terminate. This is a Base Case failure.
2. Boundary violations. If the received bitstream violates the prefix-free structure or code constraints, the decoding rule may be undefined. This is a Boundary failure.
3. Observer or representation changes. If the symbol mapping changes during decoding, previously valid prefixes may become ambiguous. This is an Observer failure.
4. Invariant violation. If the prefix-free property is not maintained, multiple decodings become possible and the process is no longer well-defined. This is an Invariant failure.

## What This Clarifies (and What It Does Not)
What this primitive framing clarifies:
- Why prefix conditions act as hard constraints in recursive decoding.
- How invariants such as prefix-free structure guarantee unambiguous termination.
- Why iterative decoding can be understood as controlled self-application.
- How representation choices affect whether a recursive decoder is well-defined.

What remains outside scope:
- Error-correction performance or bounds on decoding probability.
- Optimality of a specific code or decoding algorithm.
- Continuous or analog information channels without discrete representation.

## Relation Back to the Canon
This domain view confirms that the canon captures the structural anatomy of recursive decoding: a state, a fixed update rule, explicit termination, and representation-dependent meaning. It constrains the canon by emphasizing the centrality of code constraints as boundaries and the role of representation in making termination unambiguous. The canon provides the structure; information theory supplies operational semantics and constraints.
