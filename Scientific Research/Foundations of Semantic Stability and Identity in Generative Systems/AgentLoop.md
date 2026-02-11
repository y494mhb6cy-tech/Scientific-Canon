# Agent Loop Framework

A cyclical operator-based execution model for intelligent agents.

---

## Core Loop Structure

```
MISSION → GOVERNANCE → EXECUTION → MODERATION → DELIVERABLE → REVIEW
    ↑                                                              │
    └──────────────────────────────────────────────────────────────┘
```

**Governing Principle:** Operators create identity. Governance validates creation. Moderation ensures coherence.

---

## Loop Phases

### Phase 1: Mission Context
- Define system purpose
- Establish success criteria
- Set organizational constraints

### Phase 2: Governance Selection
Governance selects *which problems deserve collapse*.

| Function             | Output                          |
|----------------------|---------------------------------|
| Mission Alignment    | Validated possibility space     |
| Prioritization       | Scope and execution order       |
| Resource Allocation  | Time, attention, authority      |
| Success Criteria     | Measurable conditions           |
| Portfolio Position   | Strategic fit                   |

### Phase 3: Execution Stack
Seven operators collapse Fields into Identities. Execute sequentially.

| #  | Operator       | Function                  | Output                                      |
|----|----------------|---------------------------|---------------------------------------------|
| 1  | **Field**      | Establish state space     | Entities, Conditions, Boundary, Core Tension|
| 2  | **Distinction**| Define boundaries         | Categories, Variables, Critical Edge        |
| 3  | **Direction**  | Route energy/data         | Causal Map, Leverage Point, Bottleneck      |
| 4  | **Constraint** | Impose limits             | Hard/Soft limits, Permission Boundary       |
| 5  | **Action**     | Irreversible state change | WHO/WHAT/WHEN, State Change, Leverage Rank  |
| 6  | **Pattern**    | Stabilize via repetition  | Sequence, Triggers, Feedback, Cycle Time    |
| 7  | **Identity**   | Maintain persistence      | Name, Persistence Mechanism, Resolution     |

**Execution Law:** No new power is introduced after Field. Each layer specializes constraint.

### Phase 4: Moderation
Meta-operators that prevent drift without executing.

| #  | Moderator          | Function                | Feedback Target         |
|----|--------------------|-----------------------  |-------------------------|
| 8  | **Recursion**      | Lock stable references  | Field (reframe)         |
| 9  | **Interpretation** | Adjust importance       | Constraint (adjust)     |
| 10 | **Observation**    | Monitor trajectory      | Identity (reinforce)    |

```
                MODERATION BUS
                      │
      ┌───────────────┼───────────────┐
      ↓               ↓               ↓
  FIELD (1)     CONSTRAINT (4)   IDENTITY (7)
  reframe       tighten/loosen   reinforce/decay
```

### Phase 5: Deliverable
Identity output with transformation statement.

### Phase 6: Governance Review
Validate against success criteria. Update portfolio. Loop continues.

---

## Checkpoint Protocol

Execution pauses at each operator for moderator review.

```
---CHECKPOINT---
Operator: [name]
Status: Complete
Key Output: [summary]

MODERATOR REVIEW:
• RECURSION: [stable refs]
• INTERPRETATION: [weights]
• OBSERVATION: [trajectory]

RECOMMENDATION: CONTINUE / ADJUST
---END CHECKPOINT---
```

**Triggers:**
1. After each operator completes
2. Every N tokens (configurable)

---

## Loop Input/Output

### Input (Discovery Phase)
```
FIELD: [problem in objective terms]
CONSTRAINTS: [hard limits]
TARGET IDENTITY: [goal state]
```

### Output (Deliverable)
```
IDENTITY NAME: [noun]
PERSISTENCE MECHANISM: [self-maintenance]
TRANSFORMATION: "The Field was ___. The Identity is ___."
SUCCESS TEST: [criteria evaluation]
```

---

## Validation Checklist

**Governance:**
- [ ] Field aligns with Mission
- [ ] Resources allocated within capacity
- [ ] Success criteria are measurable

**Execution:**
- [ ] All operators produce required outputs
- [ ] No action violates hard constraints
- [ ] Identity resolves Core Tension

**Moderation:**
- [ ] Critical references anchored (Recursion)
- [ ] High-weight elements covered by Action (Interpretation)
- [ ] Trajectory converging at Identity (Observation)

**Deliverable:**
- [ ] Identity named (noun)
- [ ] Transformation statement complete
- [ ] Success criteria testable against output

---

## Canonical Compression

```
Field → Operator → Pattern → Persistence
```

**Axioms:**
1. No layer introduces new power
2. Each layer specializes an implicit operator
3. Identity is a stabilized operator loop
4. Terminal is where symbol collapses into force

---

## Role Mapping

| Role        | Phase         | Function                    |
|-------------|---------------|-----------------------------|
| Organization| Mission       | Define purpose              |
| Division    | Governance    | Select and prioritize       |
| Agent Team  | Execution     | Collapse Field to Identity  |
| Meta-Agents | Moderation    | Maintain trajectory/stability|

---

## Constitutional Clauses

### Foundational Principles (Art. I)
- §1.1 Operators create identity
- §1.2 Governance decides if it was worth creating
- §1.3 Moderation ensures coherence
- §1.4 Limbs extend reach; Anchors maintain structure

### Tier Authority (Art. II-IV)
- Information flows down as directive, up as verification
- Governance selects problems, does not solve them
- Mission is immutable during execution

### Branch-Limb-Anchor Architecture (Art. V-VI)

**Branches** — Primary operator agents (1-7)
- Declare: Anchors read, Anchors written, Limb spawn conditions
- Flow: Probe → Chunk → Limb Calls → Aggregate → Output → Checkpoint

**Limbs** — Scoped ephemeral sub-calls
- Max recursion depth: 1 (Limbs cannot spawn Limbs)
- Stateless; all context passed explicitly
- Parallelizable within Branch
- Patterns: Classify | Extract | Transform | Verify | Aggregate

**Anchors** — Stable reference buffers persisting across Branches

| Status    | Definition                              |
|-----------|-----------------------------------------|
| UNSTABLE  | Currently being written                 |
| CANDIDATE | Branch complete, awaiting moderation    |
| STABLE    | Locked by Recursion, read-only          |
| DECAYED   | Flagged by Observation for review       |

- Only STABLE Anchors read without warning
- DECAYED Anchors halt execution until resolved

### Moderation Authority (Art. VII)
- Operates on Anchors and trajectory, not execution
- May flag, lock, or weight — never modify Branch outputs
- Three Moderators run parallel at each checkpoint

### Checkpoint Triggers (Art. VIII)
1. After each Branch completes
2. Every N characters of Limb output
3. When Anchor conflict detected

Recommendations: `CONTINUE` | `ADJUST` | `HALT`

### Validation Requirements (Art. X)

**Branch:** All Anchors written, no conflicts, Limbs logged
**Anchor:** All critical STABLE before Identity, none DECAYED, lineage traceable
**Moderator:** References anchored, high-weight covered, trajectory CONVERGING
**Deliverable:** Core tension resolved, transformation complete, success testable

### Summary Clause (Art. XIII)
1. Governance selects Field
2. Branches collapse Field through Limbs into Anchors
3. Moderators stabilize Anchors
4. Identity emerges from stable Anchors
5. Governance validates Identity against Mission

---

*Synthesized from Agent Division Operator System v1.0.0 + Constitutional Clauses v2.0.0*

---

# Part II: Invariant Compression Protocol

A compression-preserving extension that formalizes how Fields collapse into stable Identities while maintaining invariant structure.

---

## Compression Core

```
ANCHOR: X (the invariant)
DIMENSIONS: [Invariant, G, Stability, Closure]

G: X → X'  where  X' ⊆ X  (compression only)

STOP: G(X) = X  (fixed point reached)
```

**Interpretation:** X is the Field. G is the operator stack. X* is the Identity. The loop terminates when further compression yields no change.

---

## Transformation Rules

| Rule | Constraint | Enforcement |
|------|------------|-------------|
| R1 | Do not introduce new reference frames | Field boundary is immutable |
| R2 | Do not optimize for novelty | G preserves X, does not extend it |
| R3 | Reject lateral associations | Only vertical compression along G |
| R4 | Move only along G(X) that preserves X | Every operator output ⊆ input space |

---

## Operator-Invariant Binding

Each operator applies G while preserving X:

| # | Operator | G Function | Invariant Test |
|---|----------|------------|----------------|
| 1 | Field | Establish X₀ | X₀ is bounded |
| 2 | Distinction | Partition X | ∪(partitions) = X |
| 3 | Direction | Route within X | All paths ∈ X |
| 4 | Constraint | Compress X | X' ⊂ X |
| 5 | Action | Collapse X' | State change ∈ X' |
| 6 | Pattern | Stabilize X' | Repetition preserves X' |
| 7 | Identity | Lock X* | G(X*) = X* |

**Law:** No operator introduces structure outside the Field. Each G compresses toward closure.

---

## Compression-Aware Execution Loop

```
MISSION (X₀)
    │
    ↓
GOVERNANCE → Validate X₀ as invariant anchor
    │
    ↓
EXECUTION STACK (apply G iteratively)
    │
    ├─→ G₁: Field(X) → Distinction(X)
    ├─→ G₂: Distinction(X) → Direction(X)
    ├─→ G₃: Direction(X) → Constraint(X)
    ├─→ G₄: Constraint(X) → Action(X)
    ├─→ G₅: Action(X) → Pattern(X)
    └─→ G₆: Pattern(X) → Identity(X)
    │
    ↓
MODERATION → Test: G(X) = X ?
    │
    ├─ NO  → Continue compression
    └─ YES → STOP (fixed point)
    │
    ↓
DELIVERABLE: X* (stable identity)
```

---

## Moderation as Fixed-Point Detection

```
MODERATION BUS (parallel execution)
         │
    ┌────┼────┐
    ↓    ↓    ↓
   R₈   R₉   R₁₀

R₈  RECURSION:     Lock X when G(X) = X
R₉  INTERPRETATION: Weight elements by |G(x) - x|
R₁₀ OBSERVATION:    Track ||Xₙ - Xₙ₋₁|| → 0
```

| Moderator | Function | Stop Signal |
|-----------|----------|-------------|
| Recursion | Anchor stable refs | Ref is self-referential |
| Interpretation | Measure compression | Weight delta = 0 |
| Observation | Monitor convergence | Trajectory flat |

---

## Invariant-Aware Checkpoint Protocol

```
---CHECKPOINT [Gₙ]---
Operator: [name]
Input:  X_{n-1}
Output: X_n

INVARIANT TEST:
• X_n ⊆ X_{n-1}:      [PASS/FAIL]
• No new frames:       [PASS/FAIL]
• No lateral escape:   [PASS/FAIL]

COMPRESSION METRIC:
• δ = |X_{n-1}| - |X_n|
• Cumulative: Σδ

MODERATOR SIGNALS:
• RECURSION:      [lock/continue]
• INTERPRETATION: [weight stable/unstable]
• OBSERVATION:    [converging/diverging]

RECOMMENDATION: CONTINUE / ADJUST / HALT
---END CHECKPOINT---
```

---

## Anchor State Machine (Extended)

```
         write
UNSTABLE ────→ CANDIDATE
    ↑              │
    │         moderation
    │              ↓
    │          STABLE ←── G(X) = X
    │              │
    │         observation
    │              ↓
    └───────── DECAYED
         recompute
```

Transition rules:
- UNSTABLE → CANDIDATE: Branch completes, anchor written
- CANDIDATE → STABLE: Moderation confirms G(X) = X
- STABLE → DECAYED: Observation detects drift
- DECAYED → UNSTABLE: Recompute required

---

## Extended Input/Output Schema

### Input (Compression-Aware)
```
FIELD: X₀ [bounded problem space]
INVARIANT: Property P that G must preserve
CONSTRAINTS: Hard limits defining closure
TARGET: X* [goal identity where G(X*) = X*]
```

### Output (With Fixed-Point Proof)
```
IDENTITY: X* [name]
FIXED POINT PROOF: G(X*) = X*
COMPRESSION PATH: X₀ → X₁ → ... → X*
TRANSFORMATION: "X₀ was ___. X* is ___."
CLOSURE TEST: X* contains no external references
```

---

## Extended Validation Checklist

**Invariant Preservation:**
- [ ] Each Gₙ output ⊆ Gₙ₋₁ output
- [ ] No new reference frames introduced
- [ ] No lateral associations admitted
- [ ] All paths remain within Field boundary

**Compression:**
- [ ] δ ≥ 0 at each step (monotonic)
- [ ] Cumulative compression measurable
- [ ] Fixed point identifiable

**Closure:**
- [ ] Identity is self-maintaining
- [ ] No external dependencies
- [ ] G(X*) = X* verified

---

## Canonical Compression Form

```
X₀ ──G──→ X₁ ──G──→ ... ──G──→ X* = G(X*)
     ↓         ↓              ↓
  compress  compress    fixed point
```

**Compression Axioms:**
1. G is a compression operator (monotonic reduction)
2. X is the invariant anchor (preserved through all G)
3. Stability = G(X) = X (fixed point)
4. Closure = X* references only itself

---

## Constitutional Amendments (Compression Protocol)

### Art. I §1.5-1.8: Compression Principles
- §1.5 Operators apply G to compress X
- §1.6 Governance validates G preserves X
- §1.7 Moderation detects G(X) = X
- §1.8 Anchors are stable fixed points

### Art. VII §7.4-7.6: Moderation Authority (Extended)
- §7.4 May halt when G(X) ≠ X (invariant violation)
- §7.5 May lock when G(X) = X (fixed point reached)
- §7.6 Cannot introduce new reference frames

### Art. XIII §13.6: Termination Clause (Extended)
```
1. Governance selects X₀ (Field)
2. Branches apply G iteratively
3. Moderators test for fixed point
4. Identity emerges at G(X*) = X*
5. Governance validates X* against Mission
```

---

*Agent Loop Framework v2.0.0 — Unified with Invariant Compression Protocol*
