# Recursion in Physics: A Primitive-Based Interpretation

## Title and Domain Context
In physics, recursion most often appears as discrete-time evolution, iterative solution schemes, or repeated application of a map. Examples include time-stepping in numerical simulation, iterated maps in dynamical systems, and renormalization-like procedures in modeling. Unlike formal recursion in mathematics, physical processes do not usually terminate on their own; termination is commonly a modeling or computational decision.

## Primitive Translation Table
| Primitive | Domain-native term | Operational meaning in this domain |
| --- | --- | --- |
| State | System configuration | The variables needed to advance the system by one step (e.g., position and momentum) |
| Rule / Update Operator | Evolution map | The law that maps a current state to a next state in discrete time |
| Boundary / Constraint | Physical constraint | Conservation limits, admissible region, or imposed boundary conditions |
| Base Case / Termination Condition | Stopping criterion (imperfect analogue) | A chosen condition for halting iteration in simulation or analysis |
| Iteration / Self-Application | Time stepping | Repeated application of the evolution map |
| Observer / Representation | Measurement or coarse-graining | The mapping from state to measured quantities or summaries |
| Invariant | Conserved quantity | A property expected to remain unchanged under the update rule |

## Law of Recursion (Domain Formulation)
A discrete-time physical process is a lawful recursion when it has a well-defined state, a fixed evolution map, explicit boundaries, and a consistent iteration rule. Under a stable measurement representation, such a process exhibits predictable progression across steps and structural self-similarity in its repeated update pattern. Termination is often an imperfect analogue in physics; it typically reflects a chosen stopping criterion rather than a natural base case of the physical system.

## Worked Domain Example
Example: rotation on a circle as a discrete-time map.

Primitive mapping in the rotation map:
- State: the point on the circle represented as (x, y).
- Rule / Update Operator: apply a fixed rotation by angle omega to move the point to a new location.
- Boundary / Constraint: the point remains on the circle; radius is fixed.
- Base Case / Termination Condition: a chosen stopping criterion in computation (for example, stop after N steps). This is an imperfect analogue.
- Iteration / Self-Application: repeat the same rotation map at each step.
- Observer / Representation: record the angle or bin index of the point to summarize long-run behavior.
- Invariant: the radius is conserved under the rotation map.

This example is a lawful recursion in the sense of repeated application of a fixed update operator within a constrained state space. The observer can be a coarse-grained histogram of angles, and the invariant is radius. The base case is not inherent to the physics but is introduced to stop computation, which is why it must be labeled as an imperfect analogue.

## Failure Modes (Domain-Specific)
Recursion fails in physics when primitives are broken or ill-defined.

1. Missing boundaries. If the evolution map allows the system to drift outside the intended constraint surface, the process no longer respects its boundary conditions. This is a Boundary failure.
2. Missing base case in computation. If a simulation lacks a stopping criterion, it can run indefinitely or produce unbounded data. This is a Base Case failure in the computational sense.
3. Observer changes mid-process. If the measurement definition changes across steps, apparent invariants may be lost or artifacts introduced. This is an Observer failure.
4. Invariant violation. If the evolution map is implemented inaccurately, conserved quantities may drift, indicating a Rule or Invariant failure.

## What This Clarifies (and What It Does Not)
What this primitive framing clarifies:
- Why discrete-time maps in physics are structurally recursive.
- How invariants provide a test for correctness of iterative models.
- Why boundary conditions are essential to the meaning of a physical recursion.
- Why termination is a modeling choice rather than a physical necessity.

What remains outside scope:
- Continuous-time dynamics without discretization.
- Claims of universality for recursion across all physical systems.
- Quantitative error bounds for numerical integrators.

## Relation Back to the Canon
This domain view confirms that recursion in physics is best understood as repeated application of a fixed update rule under constraints, with observation and invariants providing operational meaning. It constrains the canon by showing that the base case is often a computational artifact rather than a physical termination. The canon remains a structural guide; physics adds the reminder that recursion is usually embedded in modeling choices and measurement assumptions.
