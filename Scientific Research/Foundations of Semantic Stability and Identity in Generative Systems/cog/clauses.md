# Behavioral Clauses: Ontological Wall Control

Hard constraints that enforce straight-line traversal. These are the "rails" that prevent semantic wandering.

---

## Core Clauses

### §1 — Invariant First

> **Always restate the anchor before reasoning.**

The anchor is X₀. Every traversal step must begin by grounding in X₀. No reasoning proceeds until the invariant is explicit.

**Implementation:** Chain output begins with `anchor` field containing exact input anchor.

---

### §2 — No New Frames

> **Do not introduce new primitives unless explicitly allowed.**

The Field boundary is immutable. G preserves X, does not extend it. Any term not derivable from anchor vocabulary is a frame violation.

**Implementation:** `novelty_penalty()` measures fraction of chunk vocabulary outside anchor vocabulary.

---

### §3 — Projection Only

> **Each step must increase anchor alignment score or reduce ambiguity score.**

Movement is vertical compression only. Lateral associations are rejected. Every G(X) → X' must satisfy X' ⊆ X.

**Implementation:** Scoring formula `(0.65 × align) - (0.25 × novelty) - (0.10 × ambiguity)` enforces convergent trajectory.

---

### §4 — Stop on Closure

> **Stop when the next step does not improve invariance or adds new primitives.**

Fixed point detection: when G(X) = X, halt. Continuing past closure produces drift, not knowledge.

**Implementation:** Chain terminates when `score < 0.02` (no meaningful improvement).

---

### §5 — Cite Every Step

> **Every step must cite a repo location (file + heading or line range).**

If it cannot be grounded in repository citations, it is not knowledge—just semantics. The ontological wall separates what-can-be-cited from what-cannot.

**Implementation:** Every chain entry contains `path` and `heading` fields.

---

## Derived Rules (from Agent Loop Transformation Rules)

| Rule | Constraint | Clause Mapping |
|------|------------|----------------|
| R1 | Do not introduce new reference frames | §2 No New Frames |
| R2 | Do not optimize for novelty | §3 Projection Only |
| R3 | Reject lateral associations | §3 Projection Only |
| R4 | Move only along G(X) preserving X | §1 Invariant First |

---

## Enforcement Hierarchy

```
INVARIANT FIRST (§1)
       │
       ↓
NO NEW FRAMES (§2) ←── novelty_penalty()
       │
       ↓
PROJECTION ONLY (§3) ←── scoring function
       │
       ↓
STOP ON CLOSURE (§4) ←── threshold check
       │
       ↓
CITE EVERY STEP (§5) ←── chain structure
```

---

## Boundary Definition

The **ontological wall** is the line between:

| Grounded (Knowledge) | Ungrounded (Semantic Only) |
|---------------------|---------------------------|
| Has repo citation | No citation possible |
| Terms ∈ anchor vocabulary | Terms ∉ anchor vocabulary |
| Decreases ambiguity | Increases ambiguity |
| Converges to fixed point | Diverges or oscillates |

**Rule:** If a claim cannot be grounded in repo citations, label it `semantic-only` and halt.
