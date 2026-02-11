# InvariantAI

A portable reasoning policy enforcement tool for invariant-preserving semantic traversal.

## Overview

InvariantAI enforces dimensional reference scripts that constrain reasoning to preserve semantic invariants. It supports two modes:

- **Straight-line mode**: Invariant-preserving, convergent reasoning with low semantic energy
- **Curved mode**: Exploratory, divergent reasoning with higher semantic energy

## Installation

```bash
# Install from source
pip install .

# With YAML support (recommended)
pip install ".[yaml]"
```

## Usage

### Command Line

```bash
# Analyze text against an anchor
invariantai analyze response.txt --anchor "operators create identity"

# Generate a prompt for straight-line mode
invariantai prompt --anchor "X" --mode straight_line

# Validate output against policy
invariantai validate output.txt --anchor "X" --mode straight_line

# Compare two outputs
invariantai compare curved.txt straight.txt --anchor "X"

# Traverse a repository
invariantai traverse ./docs --anchor "X" --steps 6
```

### Python API

```python
from invariantai import analyze_text, validate_output, generate_prompt

# Analyze text
metrics = analyze_text(text, anchor="operators create identity")
print(f"Score: {metrics['score']}")
print(f"Energy: {metrics['energy']}")

# Validate against policy
result = validate_output(text, anchor="X", mode="straight_line")
if not result['valid']:
    print("Violations:", result['violations'])

# Generate a prompt
prompt = generate_prompt(anchor="X", mode="straight_line", steps=6)
```

### Using a Policy File

```bash
invariantai analyze response.txt --policy policy.yaml --anchor "X"
```

## Policy Configuration

The policy YAML file defines:

- **anchor**: The invariant that must be preserved
- **mode**: Reasoning traversal mode (straight_line or curved)
- **clauses**: Hard behavioral constraints
- **transformations**: Allowed and forbidden operations
- **scoring**: Weights for traversal decisions
- **vocabulary**: Controlled vocabulary lists

See `invariantai/default_policy.yaml` for a complete example.

## Metrics

| Metric | Description |
|--------|-------------|
| `anchor_alignment` | Cosine similarity to anchor vocabulary |
| `novelty_rate` | Fraction of terms not in anchor |
| `ambiguity_rate` | Hedge words per 100 words |
| `frame_switches` | Count of frame-switching markers |
| `energy` | Composite cost proxy |
| `score` | Weighted composite score |

## Scaling Law

Semantic cost scales:
- **Superadditively** under unconstrained exploration (curved)
- **Additively** under independent primitives
- **Subadditively** under integrated primitives with identity preservation

Only subadditive scaling is sustainable for coherent reasoning.

## License

MIT
