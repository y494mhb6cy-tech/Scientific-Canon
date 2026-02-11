# COG Experiment: Curved vs Straight-Line Traversal

Experiment comparing energy efficiency of two reasoning modes when navigating a contextual repository.

## Hypothesis

Straight-line traversal (invariant-preserving) should be more "energy efficient" than curved traversal (default helpful reasoning), measured by:
- Less output (chars, words)
- Lower novelty rate (fewer new terms)
- Lower ambiguity rate (less hedge language)
- Fewer frame switches
- Better anchor preservation

## Conditions

### A: Curved Traversal (Control)
- Normal helpful repo reasoning
- Paraphrase allowed
- Insight and exploration encouraged
- May introduce new frames/perspectives

### B: Straight-Line Traversal (DRS)
- Invariant First: restate anchor exactly
- No new primitives or frames
- Every step must cite file + heading
- Penalize novelty
- Stop on closure
- End with anchor verbatim

## Anchor (Invariant X₀)

```
"operators create identity governance validates moderation ensures coherence"
```

## Task (Same for A and B)

> Using only this repo, produce a 6-step chain (file + heading) that best supports the anchor, then output a 2-sentence compression that preserves the anchor language.

## Measurements

| Metric | Description | Prefer |
|--------|-------------|--------|
| chars_out | Total output characters | Lower |
| words_out | Total output words | Lower |
| anchor_preservation | Exact anchor matches in output | Higher |
| citations_count | Count of file.md references | Higher |
| novelty_rate | Fraction of tokens not in anchor vocab | Lower |
| ambiguity_rate | Hedge words per 100 words | Lower |
| frame_switches | Count of "however", "alternatively", etc. | Lower |
| step_count | Actual steps produced | 6 |

## Files

```
cog_exp/
├── drs.yaml           # Dimensional Reference Script config
├── prompts.json       # Prompt variants for A and B
├── run_experiment.sh  # Runs Claude CLI twice
├── evaluate.py        # Computes metrics and prints results
├── out_A.txt          # Output from Condition A (generated)
├── out_B.txt          # Output from Condition B (generated)
├── timing.json        # Execution times (generated)
├── results.json       # Full results (generated)
└── README.md          # This file
```

## Run

```bash
cd /path/to/repo
bash cog_exp/run_experiment.sh
```

Or manually:
```bash
# Run each condition
claude -p "..." > cog_exp/out_A.txt
claude -p "..." > cog_exp/out_B.txt

# Evaluate
python3 cog_exp/evaluate.py
```

## Energy Proxy Formula

```
energy = chars_out + (novelty_rate × 1000) + (frame_switches × 100)
```

Lower energy = more efficient traversal.

## Expected Results

Straight-line (B) should win on:
- anchor_preservation (enforced by prompt)
- novelty_rate (penalized by rules)
- ambiguity_rate (hedge words forbidden)
- frame_switches (no "however" allowed)
- chars_out (compression enforced)

Curved (A) may win on:
- insight quality (subjective)
- exploration breadth (not measured)
