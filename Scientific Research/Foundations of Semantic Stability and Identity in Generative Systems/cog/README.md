# COG: Straight-Line Traversal Engine

Minimal prototype proving "straight-line traversal" (invariant-preserving navigation) inside a contextual repository.

**No embeddings. No vector DB. No agent frameworks.**

---

## What This Proves

1. **Knowledge-style traversal** — Anchored, convergent navigation through repo content
2. **Quantified curvature** — Novelty + ambiguity penalties measure drift
3. **Basin of attraction** — The repo itself behaves as an attractor around the anchor
4. **Hallucination boundary** — No citation → no knowledge (ontological wall enforcement)

---

## Quick Start

```bash
# Navigate to repo root and run:
python3 cog/drs.py . --anchor "ontological wall = space between semantic expression and knowledge"

# With more options:
python3 cog/drs.py . --anchor "operators create identity" --steps 5 --verbose

# Save output:
python3 cog/drs.py . --anchor "invariant compression protocol" --output chain.json
```

---

## Architecture

```
cog/
├── PRD.md        # Product requirements & success criteria
├── clauses.md    # Behavioral constraints (the rails)
├── drs.yaml      # Dimensional Reference Script (coordinate system)
├── drs.py        # Traversal engine (no dependencies beyond stdlib)
└── README.md     # This file
```

---

## How It Works

### The Invariant Compression Protocol

```
X₀ ──G──→ X₁ ──G──→ ... ──G──→ X* = G(X*)
```

- **X₀** is your anchor (the invariant)
- **G** is the traversal operator (compression only)
- **X*** is the fixed point (where G(X) = X)

### Scoring Formula

Each candidate chunk is scored:

```
score = (0.65 × anchor_alignment) - (0.25 × novelty) - (0.10 × ambiguity)
```

| Weight | Metric | Purpose |
|--------|--------|---------|
| 0.65 | `anchor_alignment` | Cosine similarity to anchor vocabulary |
| 0.25 | `novelty_penalty` | Fraction of terms outside anchor vocab |
| 0.10 | `ambiguity_penalty` | Hedge language density |

### Termination Conditions

- **Fixed point**: `score < 0.02` (no meaningful improvement)
- **Max steps**: Chain reaches configured limit (default: 7)

---

## Behavioral Clauses

The engine enforces five hard constraints:

| Clause | Rule | Enforcement |
|--------|------|-------------|
| §1 | **Invariant First** — Always restate anchor before reasoning | Anchor parameter required |
| §2 | **No New Frames** — No new primitives unless allowed | `novelty_penalty()` |
| §3 | **Projection Only** — Each step must improve alignment | Scoring formula |
| §4 | **Stop on Closure** — Halt when no improvement possible | Threshold check |
| §5 | **Cite Every Step** — Every step must cite repo location | Chain structure |

---

## Output Format

```json
{
  "anchor": "your anchor text",
  "chain_length": 5,
  "chain": [
    {
      "step": 1,
      "path": "relative/path/to/file.md",
      "heading": "## Section Heading",
      "metrics": {
        "anchor_alignment": 0.4523,
        "novelty_penalty": 0.3214,
        "ambiguity_penalty": 0.0000,
        "score": 0.2136
      }
    }
  ],
  "closure": {
    "reached": true,
    "reason": "fixed_point",
    "note": "G(X) = X: no step improves invariant alignment"
  }
}
```

---

## Alignment with Agent Loop Framework

| Framework Concept | Prototype Implementation |
|-------------------|-------------------------|
| G: X → X' where X' ⊆ X | `pick_chain()` selects preserving steps |
| Fixed Point: G(X) = X | Stop when `score < 0.02` |
| R1: No new frames | `novelty_penalty()` |
| R2: No novelty optimization | Alignment-first scoring |
| R3: Reject lateral associations | Ambiguity penalty |
| Moderator: Observation | Trajectory tracked via scores |
| Anchor state machine | Used set prevents re-visitation |

---

## Extension Points

### Competing Reference Point Detection

Add explicit detection of top-N terms per chunk. If a chunk introduces a new top reference point not in anchor vocab, reject as lateral drift.

### Multi-file Type Support

Extend `chunk_markdown()` to handle:
- `.py` → chunk by function/class definitions
- `.ts/.js` → chunk by exports
- `.yaml` → chunk by top-level keys

### Embedding Upgrade Path

Replace `cosine_similarity()` with embedding-based similarity while keeping the same scoring formula. The architecture remains unchanged.

---

## Why This Matters

Traditional search returns "relevant" documents. This returns a **convergent path** — a linear chain that:

1. Starts at your invariant
2. Moves only toward the invariant (compression)
3. Stops when the invariant is maximally expressed
4. Rejects lateral associations and frame shifts

This is **knowledge traversal**, not **semantic wandering**.
