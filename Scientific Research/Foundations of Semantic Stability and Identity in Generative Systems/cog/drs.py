#!/usr/bin/env python3
"""
Dimensional Reference Script Traversal Engine

Implements straight-line repo navigation through invariant-preserving projection.
No embeddings, no vector DB — pure term alignment scoring.

Invariant Compression Protocol:
  X₀ ──G──→ X₁ ──G──→ ... ──G──→ X* = G(X*)

Where:
  - X₀ is the anchor (invariant)
  - G is the traversal operator (compression only)
  - X* is the fixed point (chain terminus)
"""

import os
import re
import math
import json
from collections import Counter
from typing import List, Dict, Set, Tuple, Optional

# Scoring weights from drs.yaml
ANCHOR_ALIGNMENT_WEIGHT = 0.65
NOVELTY_PENALTY_WEIGHT = 0.25
AMBIGUITY_PENALTY_WEIGHT = 0.10

# Chain parameters
MIN_STEPS = 3
MAX_STEPS = 7
SCORE_THRESHOLD = 0.02  # Fixed point detection

# Stopwords (excluded from vocabulary analysis)
STOPWORDS = set("""
a an and are as at be but by for if in into is it its no not of on or
that the their then there these they this to was were will with would
can could did do does had has have how may might must shall should
very what when where which who why you your
""".split())


def tokenize(text: str) -> List[str]:
    """Extract meaningful terms from text, excluding stopwords."""
    words = re.findall(r"[A-Za-z][A-Za-z0-9_\-']+", text.lower())
    return [w for w in words if w not in STOPWORDS and len(w) > 2]


def read_md_files(root: str) -> List[str]:
    """Recursively find all .md files in directory tree."""
    paths = []
    for dirpath, _, filenames in os.walk(root):
        for fn in filenames:
            if fn.lower().endswith(".md"):
                paths.append(os.path.join(dirpath, fn))
    return sorted(paths)


def chunk_markdown(path: str) -> List[Tuple[str, str]]:
    """
    Split markdown file into chunks by heading.
    Returns list of (heading, body) tuples.
    """
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()
    except IOError:
        return []

    # Split by headings (capture heading as delimiter)
    parts = re.split(r"(?m)^(#{1,6}\s+.+)$", text)
    chunks = []

    # Handle preamble (text before first heading)
    if parts:
        pre = parts[0].strip()
        if pre and len(pre) > 50:  # Only include substantial preambles
            chunks.append(("Preamble", pre))

        # Process heading + body pairs
        i = 1
        while i < len(parts) - 1:
            heading = parts[i].strip()
            body = parts[i + 1].strip()
            if body and len(body) > 30:  # Skip empty/trivial sections
                chunks.append((heading, body))
            i += 2

    return chunks


def tf(counter: Counter) -> Dict[str, float]:
    """Compute term frequency (normalized)."""
    total = sum(counter.values()) or 1
    return {k: v / total for k, v in counter.items()}


def cosine_similarity(a: Dict[str, float], b: Dict[str, float]) -> float:
    """Compute cosine similarity between two TF vectors."""
    dot = sum(a.get(k, 0) * b.get(k, 0) for k in set(a) | set(b))
    norm_a = math.sqrt(sum(v * v for v in a.values())) or 1.0
    norm_b = math.sqrt(sum(v * v for v in b.values())) or 1.0
    return dot / (norm_a * norm_b)


def novelty_penalty(anchor_vocab: Set[str], chunk_vocab: Set[str]) -> float:
    """
    Penalty for introducing terms outside anchor vocabulary.
    Implements §2 (No New Frames): penalize new primitives.

    Returns: fraction of chunk vocab not in anchor vocab (0.0 = perfect, 1.0 = all new)
    """
    if not chunk_vocab:
        return 1.0
    new_terms = chunk_vocab - anchor_vocab
    return len(new_terms) / max(1, len(chunk_vocab))


def ambiguity_penalty(text: str) -> float:
    """
    Penalty for hedge/uncertain language.
    Implements stability dimension: prefer steps that reduce competing frames.

    Returns: ambiguity score (0.0 = certain, 1.0 = highly ambiguous)
    """
    hedges = [
        "maybe", "might", "could", "depends", "possible", "possibly",
        "unclear", "uncertain", "perhaps", "arguably", "somewhat",
        "on the other hand", "alternatively", "it depends",
        "one could argue", "some say", "others believe"
    ]
    t = text.lower()
    hits = sum(t.count(h) for h in hedges)
    return min(1.0, hits / 5.0)


def score_chunk(
    anchor_tf: Dict[str, float],
    anchor_vocab: Set[str],
    chunk_entry: Dict
) -> Tuple[float, float, float, float]:
    """
    Score a chunk for invariant-preserving traversal.

    Returns: (alignment, novelty, ambiguity, total_score)
    """
    align = cosine_similarity(anchor_tf, chunk_entry["tf"])
    novelty = novelty_penalty(anchor_vocab, chunk_entry["vocab"])
    ambiguity = ambiguity_penalty(chunk_entry["body"])

    # Scoring formula from drs.yaml
    score = (
        (ANCHOR_ALIGNMENT_WEIGHT * align) -
        (NOVELTY_PENALTY_WEIGHT * novelty) -
        (AMBIGUITY_PENALTY_WEIGHT * ambiguity)
    )

    return align, novelty, ambiguity, score


def build_index(repo_root: str) -> List[Dict]:
    """
    Build searchable index of all markdown chunks.
    No embeddings — just term frequency vectors.
    """
    entries = []
    for path in read_md_files(repo_root):
        rel_path = os.path.relpath(path, repo_root)
        chunks = chunk_markdown(path)

        for heading, body in chunks:
            tokens = tokenize(heading + "\n" + body)
            if not tokens:
                continue

            counter = Counter(tokens)
            entries.append({
                "path": rel_path,
                "abs_path": path,
                "heading": heading,
                "body": body,
                "tf": tf(counter),
                "vocab": set(counter.keys()),
                "token_count": len(tokens)
            })

    return entries


def pick_chain(
    entries: List[Dict],
    anchor_text: str,
    max_steps: int = MAX_STEPS
) -> List[Dict]:
    """
    Build linear chain by repeatedly selecting best invariant-preserving step.

    Implements G: X → X' where X' ⊆ X (compression only).
    Stops when G(X) = X (fixed point: score < threshold).
    """
    # Compute anchor features (§1: Invariant First)
    anchor_tokens = tokenize(anchor_text)
    anchor_vocab = set(anchor_tokens)
    anchor_tf = tf(Counter(anchor_tokens))

    used = set()
    chain = []

    for step in range(max_steps):
        best = None
        best_score = -float("inf")

        # Find best next step (§3: Projection Only)
        for idx, entry in enumerate(entries):
            if idx in used:
                continue

            align, novelty, ambiguity, score = score_chunk(
                anchor_tf, anchor_vocab, entry
            )

            if score > best_score:
                best_score = score
                best = (idx, entry, align, novelty, ambiguity, score)

        if not best:
            break

        idx, entry, align, novelty, ambiguity, score = best

        # §4: Stop on Closure (fixed point detection)
        if score < SCORE_THRESHOLD:
            break

        used.add(idx)
        chain.append({
            "step": step + 1,
            "path": entry["path"],
            "heading": entry["heading"],
            "metrics": {
                "anchor_alignment": round(align, 4),
                "novelty_penalty": round(novelty, 4),
                "ambiguity_penalty": round(ambiguity, 4),
                "score": round(score, 4)
            },
            "preview": entry["body"][:200] + "..." if len(entry["body"]) > 200 else entry["body"]
        })

    return chain


def format_output(anchor: str, chain: List[Dict], verbose: bool = False) -> Dict:
    """Format traversal results."""
    output = {
        "anchor": anchor,
        "chain_length": len(chain),
        "chain": chain,
        "closure": {
            "reached": len(chain) < MAX_STEPS,
            "reason": "fixed_point" if len(chain) < MAX_STEPS else "max_steps",
            "note": "G(X) = X: no step improves invariant alignment" if len(chain) < MAX_STEPS else "Max steps reached"
        },
        "protocol": {
            "mode": "straight_line",
            "formula": f"score = ({ANCHOR_ALIGNMENT_WEIGHT} × align) - ({NOVELTY_PENALTY_WEIGHT} × novelty) - ({AMBIGUITY_PENALTY_WEIGHT} × ambiguity)",
            "threshold": SCORE_THRESHOLD
        }
    }

    if not verbose:
        # Remove preview text in non-verbose mode
        for step in output["chain"]:
            del step["preview"]

    return output


def main():
    import argparse

    parser = argparse.ArgumentParser(
        description="Dimensional Reference Script: Straight-line repo traversal",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python drs.py . --anchor "ontological wall = space between semantic expression and knowledge"
  python drs.py ./docs --anchor "invariant compression" --steps 5 --verbose
  python drs.py . --anchor "operator creates identity" --output chain.json
        """
    )

    parser.add_argument(
        "repo",
        help="Path to repository root"
    )
    parser.add_argument(
        "--anchor", "-a",
        required=True,
        help="Invariant anchor text (the X₀ that must be preserved)"
    )
    parser.add_argument(
        "--steps", "-s",
        type=int,
        default=MAX_STEPS,
        help=f"Maximum chain length (default: {MAX_STEPS})"
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Include body preview in output"
    )
    parser.add_argument(
        "--output", "-o",
        help="Write output to file (JSON)"
    )

    args = parser.parse_args()

    # Validate repo path
    if not os.path.isdir(args.repo):
        print(f"Error: '{args.repo}' is not a directory")
        return 1

    # Build index
    print(f"Indexing markdown files in: {args.repo}", file=__import__('sys').stderr)
    entries = build_index(args.repo)
    print(f"Found {len(entries)} chunks across {len(set(e['path'] for e in entries))} files", file=__import__('sys').stderr)

    if not entries:
        print("Error: No markdown content found", file=__import__('sys').stderr)
        return 1

    # Build chain
    chain = pick_chain(entries, args.anchor, max_steps=args.steps)

    # Format output
    result = format_output(args.anchor, chain, verbose=args.verbose)

    # Output
    output_json = json.dumps(result, indent=2)

    if args.output:
        with open(args.output, "w") as f:
            f.write(output_json)
        print(f"Output written to: {args.output}", file=__import__('sys').stderr)
    else:
        print(output_json)

    return 0


if __name__ == "__main__":
    exit(main())
