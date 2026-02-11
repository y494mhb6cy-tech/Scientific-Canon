# Product Requirements Document: Straight-Line Traversal Engine

## Goal

Navigate repo content "in straight lines" by holding an invariant anchor and only permitting transformations that preserve it.

This implements the Invariant Compression Protocol:
```
X₀ ──G──→ X₁ ──G──→ ... ──G──→ X* = G(X*)
```

Where G is compression-only (monotonic reduction) and X* is the fixed point.

---

## Success Criteria (Measurable)

Given a query + anchor, the system outputs:

1. **Anchor Definition** — The invariant restated
2. **Linear Chain** — 3–7 step chain of citations (files + headings)
3. **Final Compression** — Re-states the anchor unchanged (fixed point proof)

Each step must satisfy:
- `anchor_alignment_score ≥ 0.02`
- `novelty_penalty < 0.8` (prevents lateral drift)
- `ambiguity_penalty < 0.5` (prevents hedge language accumulation)

---

## Non-Goals

- No embeddings, no vector DB, no agent frameworks
- No "creative exploration" mode
- No introduction of new reference frames
- No lateral associations (vertical compression only)

---

## Alignment with Agent Loop Framework

This prototype implements a minimal version of the Invariant Compression Protocol:

| Framework Concept | Prototype Implementation |
|-------------------|-------------------------|
| G: X → X' where X' ⊆ X | `pick_chain()` selects steps that preserve anchor vocabulary |
| Fixed Point: G(X) = X | Stop when score < 0.02 (no improvement) |
| R1: No new frames | `novelty_penalty()` penalizes new terms |
| R2: No novelty optimization | Scoring prioritizes alignment over discovery |
| R3: Reject lateral associations | Ambiguity penalty rejects hedge language |
| R4: Move only along G(X) preserving X | Chain construction follows invariant |

---

## Scoring Formula

```
score = (0.65 × anchor_alignment) - (0.25 × novelty) - (0.10 × ambiguity)
```

Weights derived from `drs.yaml`:
- **anchor_alignment_weight: 0.65** — Primary driver
- **novelty_penalty_weight: 0.25** — Prevents frame drift
- **ambiguity_penalty_weight: 0.10** — Rejects uncertainty accumulation
