# Law of Recursion -- A Cross-Disciplinary Canon of Shared Primitives
Author: Joshua Bickel
Affiliation: Moneta Analytica

## Abstract
This document explains recursion by identifying a finite set of primitives that recur across scientific domains. The aim is not to prove a new theorem but to show how the same structural roles appear under different terminology, making recursion easier to recognize, teach, and operationalize. The canon treats recursion as a pattern of interacting primitives rather than a domain-specific trick, and it clarifies where that pattern applies and where it does not.

## Motivation
Recursion is taught differently in different fields. Mathematicians emphasize inductive definitions, computer scientists emphasize functions calling themselves, physicists speak of iterative maps and constraints, and systems biologists emphasize feedback loops and boundary conditions. The surface vocabulary differs, but the structural roles are similar.

The thesis of this canon is simple: recursion is best understood as a pattern of interacting primitives. When those primitives are present and properly aligned, a recursive process is coherent and predictable. When they are missing or mismatched, recursion fails in recognizable ways. A cross-disciplinary primitive view makes recursion easier to identify, compare, and explain without reducing it to any single domain.

## Primitive Definitions (Authoritative Section)
Each primitive below has a single abstract definition that remains stable across domains. These definitions are the reference for the rest of the document.

### Definition 1 (State)
State is the minimal description of a system or process required to apply its update rule at a given step.

Distinct from nearby concepts:
- Distinct from "history," which may include past states not needed to apply the next step.
- Distinct from "observation," which may be a lossy or partial representation of state.

### Definition 2 (Rule / Update Operator)
Rule (or update operator) is the procedure that maps a current state to a next state under fixed conditions.

Distinct from nearby concepts:
- Distinct from "policy," which may choose among multiple rules.
- Distinct from "noise," which may perturb a rule but is not the rule itself.

### Definition 3 (Boundary / Constraint)
Boundary (or constraint) is any condition that restricts the admissible states or transitions of the process.

Distinct from nearby concepts:
- Distinct from "termination" itself, which is a specific boundary outcome.
- Distinct from "rule"; a boundary limits or clips outcomes but does not generate the update.

### Definition 4 (Base Case / Termination Condition)
Base case is an explicit condition that halts recursion and yields a direct result without further self-application.

Distinct from nearby concepts:
- Distinct from "boundary" in general; base cases are specific termination outcomes.
- Distinct from "initial state"; a process can start away from the base case.

### Definition 5 (Iteration / Self-Application)
Iteration (self-application) is the repeated application of the same rule to successive states, referencing the process itself directly or indirectly.

Distinct from nearby concepts:
- Distinct from "repetition" in general; iteration uses the same update mapping and the next state depends on the prior one.
- Distinct from "parallel composition"; recursion is sequential in its dependency structure even if implemented in parallel.

### Definition 6 (Observer / Representation)
Observer (or representation) is the mapping from state to an interpretable description used to judge progress, termination, or invariants.

Distinct from nearby concepts:
- Distinct from "state"; an observer can be lossy, coarse-grained, or partial.
- Distinct from "rule"; the observer does not update the state, it interprets it.

### Definition 7 (Invariant)
Invariant is a property of state or representation that remains unchanged under the update rule across the recursion, within specified boundaries.

Distinct from nearby concepts:
- Distinct from "conservation law" in physics; an invariant can be algorithmic or representational, not necessarily physical.
- Distinct from "fixed point"; an invariant may hold even when state changes.

## Cross-Domain Mapping Table
Each primitive is aligned to five domains. When a mapping is imperfect, it is stated explicitly.

| Primitive | Mathematics | Computer Science | Physics | Information Theory | Biology / Systems |
| --- | --- | --- | --- | --- | --- |
| State | Current value in a recursive definition or sequence | Program variables or call frame | System configuration (e.g., position, momentum) | Message or system configuration in a model | System condition (e.g., population, metabolic state) |
| Rule / Update Operator | Recurrence relation | Transition function or recursive procedure | Time-step evolution law or map | Update rule in a coding/decoding or iterative scheme | Regulatory update (e.g., growth rule) |
| Boundary / Constraint | Domain restrictions (e.g., n >= 0) | Input constraints, stack limits, type invariants | Physical constraints, conservation limits | Channel capacity, coding constraints | Resource limits, carrying capacity |
| Base Case / Termination | Initial conditions in induction (e.g., n = 0) | Base case in a recursive function | Stopping condition in a finite process (imperfect analogue) | Decoding halt condition, termination criterion | Terminal developmental stage or stopping signal |
| Iteration / Self-Application | Repeated application of recurrence | Self-call of a procedure with reduced input | Discrete-time iteration of a map | Iterative refinement or decoding | Feedback loops with repeated update |
| Observer / Representation | Notation for a sequence or structure | Output format or data structure view | Measurement or coarse-graining | Encoding/decoding representation | Phenotypic readout or measured variable |
| Invariant | Inductive property preserved across steps | Loop invariant or data invariant | Conserved quantity (e.g., energy in idealized models) | Invariant statistic under a transform | Homeostatic variable or stable regulatory target |

## Law of Recursion (Primitive Formulation)
The law is stated entirely in terms of the primitives above.

Theorem 1 (Law of Recursion, primitive form). A process is a lawful recursion when it has a well-defined state, a fixed update rule, explicit base cases, and self-application that moves state toward a terminating condition under stated boundaries. Under a stable observer, such a process exhibits predictable progression and structural self-similarity in its intermediate representations. The law does not claim universality; it applies only to systems that satisfy the primitive definitions and boundary conditions.

What it claims:
- Recursion is structurally coherent when the primitives align.
- Progress toward termination and self-similar structure are expected outcomes.

What it does not claim:
- It does not guarantee numerical rates of convergence.
- It does not apply to systems without explicit base cases or stable observers.
- It does not explain open-ended emergence outside the primitive constraints.

## Worked Example (Single Thread)
Example: factorial with an accumulator.

Primitive mapping:
- State: a pair (n, acc), where n is the remaining integer and acc is the accumulated product.
- Rule / Update Operator: if n > 0, transform (n, acc) to (n - 1, acc * n).
- Boundary / Constraint: n is restricted to nonnegative integers.
- Base Case / Termination: if n = 0, return acc as the result.
- Iteration / Self-Application: the rule is applied repeatedly until the base case is reached.
- Observer / Representation: the pair (n, acc) is interpreted as "partial factorial." The observer tracks progress by decreasing n.
- Invariant: the quantity acc * n! (conceptually) corresponds to the factorial of the original input; the interpretation of acc as the product of processed terms remains consistent across steps.

This example uses only primitives to explain recursion. The same primitive explanation can be retold in another domain. For instance, in a discrete-time physical process with resource depletion, state could be (remaining resource, accumulated output), the rule reduces the remaining resource while accumulating output, the boundary is nonnegativity of resources, the base case is depletion, the observer is the measured output, and an invariant is a conserved accounting identity. The surface language changes, but the primitive roles remain the same.

## Failure Modes and Boundary Cases
Each failure is a breakdown of a specific primitive.

1. Missing boundaries: If admissible states are not constrained, recursion can drift into undefined or non-terminating regions. This breaks the Boundary / Constraint primitive.
2. Undefined base cases: Without explicit base cases, the process has no stopping condition. This breaks the Base Case primitive and makes termination undefined.
3. Observer changes mid-process: If the representation changes while the process runs, progress and invariants become ambiguous. This breaks the Observer / Representation primitive.
4. Invariant violations: If a property expected to be preserved under the rule does not hold, the process cannot be trusted to follow the intended recursion. This breaks the Invariant primitive or signals that the Rule / Update Operator is not fixed.

Each failure is structural, not merely technical. It indicates that the recursion does not meet the canonical constraints and should not be interpreted as lawful recursion under this canon.

## Relation to the Existing Law of Recursion Canon
This document complements `docs/Law_of_Recursion_Canon.md`. The existing canon explains recursion as a coherent process and focuses on how to recognize it and what patterns it produces. This document adds a cross-disciplinary alignment of primitives and shows why the law is coherent across domains. It does not replace the operational canon and does not attempt to provide test procedures. It explains why the law is structurally meaningful and how its concepts map between fields.

## Limitations
This canon does not address metaphysical claims, consciousness, cosmology, or open-ended emergence. It does not claim that every system is recursive. It does not attempt to prove specific theorems or provide quantitative bounds. It is a conceptual alignment tool intended to clarify structure, not a substitute for domain-specific theory or empirical testing.

## Conclusion
Recursion is not a domain-specific trick but a pattern of shared primitives. By defining state, rule, boundary, base case, iteration, observer, and invariant at an abstract level, we can see how the same structural roles reappear across mathematics, computation, physics, information theory, and biology. The value of this canon is pedagogical and clarifying: it makes recursion easier to compare, easier to teach, and easier to operationalize without overstating its reach.
