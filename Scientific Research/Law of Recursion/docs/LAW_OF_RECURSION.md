# Law of Recursion

## Law Statement
### FRAME
System: deterministic discrete-time state update on a bounded state space with an explicit observer-access map that returns a finite code. Observer-model: the observer only sees the coarse-grained code, not the full state. Scale: iterates and empirical distributions over many steps; excludes continuous-time dynamics and unbounded state spaces.

### GRADIENT
ASSUMPTION: the iteration operator preserves a reference measure on the bounded state space and is ergodic with respect to that measure. This is violated if the map is dissipative, has multiple invariant components, or the boundary operator clips states.

### VECTOR
Single-sentence law statement: In a bounded deterministic recursion with measure-preserving, ergodic iteration and a finite observer-access map, repeated iteration yields a unique coarse-grained invariant distribution and preserves any state function that is invariant under the iteration; departures occur only when measure preservation, ergodicity, or boundary conditions fail.

### MOMENT
This statement targets what can be defended operationally: long-run observables and conserved quantities under recursion, not claims about ontology or “emergence.” It replaces vague claims about “self-reference” with measurable invariants and convergence properties.

### DRIFT CHECK
Failure modes: the system is not measure-preserving, the dynamics are not ergodic, the observer-access map changes over time, or the boundary operator actively clips states. Any of these break the law’s predictions and falsify its applicability.

## Definitions
### FRAME
Definitions are operational for the discrete-time, bounded-state setting used in the toy model and tests.

### GRADIENT
ASSUMPTION: definitions are tied to measurable inputs and outputs. If a term cannot be computed from code, it is outside scope.

### VECTOR
- recursion: repeated application of a fixed iteration operator followed by a fixed boundary operator on a bounded state space.
- iteration operator: the deterministic map `F` that updates the state at each step.
- state: the full internal configuration `s` used by `F`, not necessarily observable directly.
- boundary: the operator `B` that enforces a bounded state space (identity when inactive, clipping or projection when active).
- observer-access: the coarse-graining map `O` from state space to a finite set of observable codes.
- conserved quantity: any function `I(s)` such that `I(F(s)) = I(s)` for all `s` within the domain where `B` is inactive.

### MOMENT
These definitions keep the law testable: every term has a concrete implementation in `src/recursion_law/`.

### DRIFT CHECK
Ambiguity points: “boundary” is sometimes used for a physical boundary; here it is an explicit operator. “Conserved” only applies where `B` is inactive; if `B` is active, conservation can fail by design.

## Domain of Validity
### FRAME
Applies to discrete-time, deterministic systems with bounded state spaces and a fixed coarse-graining observer. Excludes stochastic dynamics unless noise is explicitly modeled and bounded.

### GRADIENT
ASSUMPTION: measure-preserving iteration on the bounded state space. Violation: any contraction, expansion, or state-dependent rescaling that changes the reference measure.
ASSUMPTION: ergodicity relative to the reference measure. Violation: multiple invariant components or periodic orbits that do not cover the space.
ASSUMPTION: boundary is inactive for the states under study. Violation: clipping or projection changes conserved quantities.
ASSUMPTION: observation noise, if present, is bounded by a known tolerance smaller than the coarse-graining bin width. Violation: noise that shifts states across bins unpredictably.

### VECTOR
Counts as recursion: at least two iterations of the same `B∘F` operator with the same `O`, measured via the empirical distribution of observed codes over time.

### MOMENT
This scope is intentionally narrow to keep falsifiers crisp. It does not claim applicability to arbitrary recursion in software, biology, or physics without explicit mapping to `F`, `B`, and `O`.

### DRIFT CHECK
If any assumption is violated, the law makes no prediction and should not be applied. Specifically, boundary activation or non-ergodicity invalidates the convergence claims.

## Predictions
### FRAME
Predictions are stated for the toy model in `src/recursion_law/` (2D rotation with optional boundary and angular coarse-graining) and are operationally measurable via `iterate`, `coarse_grain`, and `invariant_measure`.

### GRADIENT
ASSUMPTION: `omega / (2π)` is irrational for the ergodic case and rational for the periodic case; boundary is inactive unless explicitly stated.

### VECTOR
1. Uniformity under irrational rotation: with `bins = K`, `steps ≥ 10_000`, `boundary_radius = 1.0`, and `omega / (2π)` irrational, `invariant_measure(trajectory).bin_l1_to_uniform ≤ 0.15`.
2. Conservation of radius: for any initial state with radius `r ≤ 1.0` and boundary inactive, `invariant_measure(trajectory).radius_std ≤ 1e-10` and `radius_mean ≈ r`.
3. Non-uniformity under rational rotation: with `omega = 2π * (p/q)`, `bins = K > q`, and `steps` a multiple of `q`, `bin_l1_to_uniform ≥ (K - q) / K`.

### MOMENT
These predictions avoid overreach: they are about measurable distributions and conserved quantities, not claims about general recursion in nature.

### DRIFT CHECK
If the histogram fails to approach uniformity in the irrational case, or if radius is not conserved when the boundary is inactive, the law’s predictions are falsified for this model.

## Falsifiers
### FRAME
Falsifiers are concrete tests within the stated domain and observer model.

### GRADIENT
ASSUMPTION: the tests use the same `F`, `B`, and `O` as defined in code; changing these invalidates the falsifier.

### VECTOR
1. With irrational `omega / (2π)` and boundary inactive, the coarse-grained histogram fails to approach uniformity within the stated tolerance after `≥ 10_000` steps.
2. With boundary inactive and `r ≤ 1.0`, the observed `radius_std` is significantly above numerical tolerance.
3. Two different initial states within the same domain yield different long-run coarse-grained distributions under the same `omega`, violating uniqueness of the invariant distribution.

### MOMENT
These falsifiers directly target the law’s core claims: convergence to an invariant distribution and conservation under recursion.

### DRIFT CHECK
If the system is not ergodic or the boundary clips states, these falsifiers no longer apply and should not be interpreted as refutations.

## Relation to Known Frameworks
### FRAME
Comparison is limited to scope overlap: discrete-time dynamics, coarse-graining, and conserved quantities.

### GRADIENT
ASSUMPTION: the comparisons are structural analogies only, not claims of equivalence or supersession.

### VECTOR
- Fixed points in dynamical systems: this law concerns fixed points of distributions under coarse-graining, not necessarily pointwise fixed states. A system can satisfy the law without having a point attractor.
- Renormalization and coarse-graining: `coarse_grain` is a measurement map, not a physical renormalization group flow. No scale invariance is claimed.
- Information-theoretic conservation: the law asserts conservation of specific invariant quantities under `F` and `B` when inactive; it does not claim conservation of total information or entropy in general.

### MOMENT
These comparisons clarify the modesty of the law: it sits at the intersection of invariant measures and observational coarse-graining, not at the level of fundamental physical laws.

### DRIFT CHECK
If the law is presented as replacing fixed-point theory, RG, or information conservation, it has drifted beyond its defended scope.

## Experiment Results (2026-02-10)
### FRAME
System: `scripts/run_recursion_experiments.py` using the 2D rotation model with angular coarse-graining. Observer-model: histogram over `bins = 16`. Scale: step counts from 500 to 20,000 for both irrational and rational rotations.

### GRADIENT
ASSUMPTION: `omega = 2π * (sqrt(2) % 1)` is irrational for the ergodic case; `omega = 2π * (1/4)` is rational for the periodic case. ASSUMPTION: boundary is inactive (`boundary_radius = 1.0`) and initial state is on the unit circle.

### VECTOR
Observed `bin_l1_to_uniform` (lower is more uniform) and `radius_std`:\n\n| label | steps | bins | radius_std | bin_l1_to_uniform |\n| --- | --- | --- | --- | --- |\n| irrational | 500 | 16 | 3.880e-15 | 0.0245 |\n| irrational | 1,000 | 16 | 7.265e-15 | 0.0099 |\n| irrational | 2,000 | 16 | 1.480e-14 | 0.0047 |\n| irrational | 5,000 | 16 | 3.565e-14 | 0.0025 |\n| irrational | 10,000 | 16 | 7.084e-14 | 0.0009 |\n| irrational | 20,000 | 16 | 1.418e-13 | 0.0007 |\n| rational_1_4 | 500 | 16 | 0.000e+00 | 1.4800 |\n| rational_1_4 | 1,000 | 16 | 0.000e+00 | 1.4900 |\n| rational_1_4 | 2,000 | 16 | 0.000e+00 | 1.4950 |\n| rational_1_4 | 5,000 | 16 | 0.000e+00 | 1.4980 |\n| rational_1_4 | 10,000 | 16 | 0.000e+00 | 1.4990 |\n| rational_1_4 | 20,000 | 16 | 0.000e+00 | 1.4995 |\n\nMapping: the irrational case supports Prediction 1; the rational case supports Prediction 3; near-zero `radius_std` supports Prediction 2.

### MOMENT
These runs establish that the law’s operational predictions are reproducible in the toy model with the current parameterization and observer-access map.

### DRIFT CHECK
Plot saved to `scripts/recursion_experiments.png`. If the observer map or bin count changes, the numeric thresholds must be recomputed; do not treat these values as universal. If plotting fails in a restricted environment, set `MPLBACKEND=Agg` and `MPLCONFIGDIR` to a writable directory.

## What Would Change My Mind?
### FRAME
Changes would require evidence within the declared domain: discrete-time, bounded, measure-preserving, ergodic systems with fixed observer-access.

### GRADIENT
ASSUMPTION: evidence must be reproducible with the same `F`, `B`, and `O` definitions in code.

### VECTOR
- A reproducible counterexample where an ergodic, measure-preserving recursion does not converge to a unique coarse-grained invariant distribution.
- A reproducible case where a conserved quantity `I(s)` (invariant under `F`) drifts over time while the boundary is inactive.
- A reproducible case where long-run distributions depend on initial conditions despite ergodicity.

### MOMENT
Each would directly contradict the law’s measurable claims and force revision or retraction.

### DRIFT CHECK
If the counterexample relies on boundary activation, changing the observer map mid-run, or non-ergodic dynamics, it is out of scope and does not change the law.
