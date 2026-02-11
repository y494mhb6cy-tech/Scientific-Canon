# Recursion in Computer Science: A Primitive-Based Interpretation

## Title and Domain Context
In computer science, recursion is typically understood as a function or procedure that calls itself on smaller inputs. It is used to define algorithms, traverse recursive data structures, and express divide-and-conquer strategies. In practice, recursion is governed by both logical constraints (base cases and reduction) and operational constraints (stack depth, input size, and runtime limits).

## Primitive Translation Table
| Primitive | Domain-native term | Operational meaning in this domain |
| --- | --- | --- |
| State | Program state or call frame | The inputs and local variables needed to perform the next recursive step |
| Rule / Update Operator | Recursive function body | The code that transforms a state into one or more smaller states |
| Boundary / Constraint | Resource and input constraints | Stack limits, type constraints, and valid input domains |
| Base Case / Termination Condition | Base case | Explicit conditional branch that returns without further calls |
| Iteration / Self-Application | Recursive call | The function invokes itself with reduced input |
| Observer / Representation | Output or trace | The data structure or return value used to interpret the recursion |
| Invariant | Loop or data invariant | A property preserved across recursive calls, such as ordering or element counts |

## Law of Recursion (Domain Formulation)
A recursive program is lawful when its state is well-defined, its recursive rule is fixed, and it includes explicit base cases that are reachable under stated input constraints. Under a stable representation of output, such a program exhibits predictable progression toward termination and structural self-similarity in its call structure. The claim is structural: it specifies when recursion is coherent and testable, not when it is optimal.

## Worked Domain Example
Example: merge sort on an array.

Primitive mapping in merge sort:
- State: a subarray or list segment to be sorted.
- Rule / Update Operator: split the state into two smaller segments, recursively sort each, then merge.
- Boundary / Constraint: the input is a finite array; memory and stack depth are finite.
- Base Case / Termination Condition: if the segment length is 0 or 1, return it unchanged.
- Iteration / Self-Application: the sorting function calls itself on each half.
- Observer / Representation: the returned array segment represents the sorted result for that state.
- Invariant: the multiset of elements is preserved across recursive calls and merge steps.

The recursion is lawful because each call reduces the segment size toward the base case, and the invariant ensures the output is a permutation of the input. The observer is the returned array segment, which is interpreted as a sorted version of the original. The boundary constraints are operational: recursion can fail if stack depth is too small or if the input violates the expected type.

## Failure Modes (Domain-Specific)
Recursion fails in computer science when primitives are broken.

1. Missing base cases. The function continues calling itself without termination, leading to stack overflow or unbounded runtime. This is a Base Case failure.
2. Boundary violations. Excessive input size or unexpected input types break the assumed constraints, causing crashes or undefined behavior. This is a Boundary failure.
3. Observer or representation changes. If a function changes the meaning of its return value mid-recursion (for example, switching output format without coordination), the recursion becomes incoherent. This is an Observer failure.

## What This Clarifies (and What It Does Not)
What this primitive framing clarifies:
- Why correct base cases are the primary correctness guard in recursive algorithms.
- How invariants can be used to reason about correctness across recursive calls.
- Why recursion and iteration are structurally similar but not equivalent.
- How resource limits function as real constraints on recursion.

What remains outside scope:
- Performance comparisons between recursion and iterative implementations.
- Language-specific runtime optimizations or tail-call elimination.
- Parallel recursion or distributed recursion semantics.

## Relation Back to the Canon
This domain view confirms that the canon captures the essential structure of recursive algorithms while reminding the reader that operational boundaries are central in software. It constrains the canon by showing that base cases must be reachable not only in theory but also under real system constraints. The canon explains the structure of recursion; this view shows how that structure is implemented and tested in practice.
