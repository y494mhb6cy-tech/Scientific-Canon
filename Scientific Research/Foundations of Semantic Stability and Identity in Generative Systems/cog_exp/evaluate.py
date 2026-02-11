#!/usr/bin/env python3
"""
Evaluate experiment outputs: Curved (A) vs Straight-Line (B) traversal.
Computes energy proxies and determines winner.
"""

import os
import re
import json
from collections import Counter

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ANCHOR = "operators create identity governance validates moderation ensures coherence"

STOPWORDS = set("""
a an and are as at be but by for if in into is it its no not of on or
that the their then there these they this to was were will with would
can could did do does had has have how may might must shall should
very what when where which who why you your
""".split())

HEDGE_WORDS = [
    "maybe", "might", "could", "depends", "unclear", "uncertain",
    "perhaps", "arguably", "possibly", "probably"
]

FRAME_SWITCH_MARKERS = [
    "however", "on the other hand", "alternatively", "another frame",
    "another perspective", "conversely", "in contrast", "that said"
]


def tokenize(text: str) -> list:
    """Extract meaningful tokens."""
    words = re.findall(r"[A-Za-z][A-Za-z0-9_\-']+", text.lower())
    return [w for w in words if w not in STOPWORDS and len(w) > 2]


def read_output(filename: str) -> str:
    """Read output file."""
    path = os.path.join(SCRIPT_DIR, filename)
    if not os.path.exists(path):
        return ""
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()


def compute_metrics(text: str, label: str) -> dict:
    """Compute all metrics for an output."""
    if not text:
        return {"error": f"No output for {label}"}

    # Basic counts
    chars_out = len(text)
    words = text.split()
    words_out = len(words)

    # Anchor preservation: exact matches
    anchor_preservation = text.lower().count(ANCHOR.lower())

    # Citations: count .md references and heading patterns
    md_refs = len(re.findall(r'\w+\.md', text, re.IGNORECASE))
    heading_refs = len(re.findall(r'[>#]\s*[A-Z]', text))
    bracket_refs = len(re.findall(r'\[.*?\.md.*?\]', text, re.IGNORECASE))
    citations_count = md_refs + bracket_refs

    # Step count: look for "Step N" patterns
    step_matches = re.findall(r'Step\s+(\d+)', text, re.IGNORECASE)
    step_count = max([int(s) for s in step_matches]) if step_matches else 0

    # Novelty rate: fraction of tokens not in anchor vocab
    anchor_tokens = set(tokenize(ANCHOR))
    output_tokens = tokenize(text)
    unique_output = set(output_tokens)

    if unique_output:
        novel_tokens = unique_output - anchor_tokens
        novelty_rate = len(novel_tokens) / len(unique_output)
    else:
        novelty_rate = 1.0

    # Ambiguity rate: hedge words per 100 words
    text_lower = text.lower()
    hedge_count = sum(text_lower.count(h) for h in HEDGE_WORDS)
    ambiguity_rate = (hedge_count / max(1, words_out)) * 100

    # Frame switches: count markers
    frame_switches = sum(text_lower.count(m) for m in FRAME_SWITCH_MARKERS)

    return {
        "chars_out": chars_out,
        "words_out": words_out,
        "anchor_preservation": anchor_preservation,
        "citations_count": citations_count,
        "step_count": step_count,
        "novelty_rate": round(novelty_rate, 4),
        "ambiguity_rate": round(ambiguity_rate, 4),
        "frame_switches": frame_switches,
        "unique_tokens": len(unique_output),
        "anchor_tokens_used": len(anchor_tokens & unique_output)
    }


def load_timing() -> dict:
    """Load timing data if available."""
    path = os.path.join(SCRIPT_DIR, "timing.json")
    if os.path.exists(path):
        with open(path) as f:
            return json.load(f)
    return {}


def print_table(metrics_a: dict, metrics_b: dict, timing: dict):
    """Print comparison table."""
    print("\n" + "=" * 70)
    print("EXPERIMENT RESULTS: Curved (A) vs Straight-Line (B)")
    print("=" * 70)
    print(f"\nAnchor: \"{ANCHOR}\"")
    print("\n" + "-" * 70)
    print(f"{'Metric':<25} {'A (Curved)':<20} {'B (Straight)':<20} {'Winner'}")
    print("-" * 70)

    comparisons = [
        ("chars_out", "lower"),
        ("words_out", "lower"),
        ("anchor_preservation", "higher"),
        ("citations_count", "higher"),
        ("step_count", "equal"),
        ("novelty_rate", "lower"),
        ("ambiguity_rate", "lower"),
        ("frame_switches", "lower"),
        ("unique_tokens", "lower"),
        ("anchor_tokens_used", "higher"),
    ]

    scores = {"A": 0, "B": 0}

    for metric, prefer in comparisons:
        val_a = metrics_a.get(metric, "N/A")
        val_b = metrics_b.get(metric, "N/A")

        # Format values
        if isinstance(val_a, float):
            str_a = f"{val_a:.4f}"
            str_b = f"{val_b:.4f}"
        else:
            str_a = str(val_a)
            str_b = str(val_b)

        # Determine winner
        winner = ""
        if isinstance(val_a, (int, float)) and isinstance(val_b, (int, float)):
            if prefer == "lower":
                if val_a < val_b:
                    winner = "A"
                    scores["A"] += 1
                elif val_b < val_a:
                    winner = "B"
                    scores["B"] += 1
                else:
                    winner = "="
            elif prefer == "higher":
                if val_a > val_b:
                    winner = "A"
                    scores["A"] += 1
                elif val_b > val_a:
                    winner = "B"
                    scores["B"] += 1
                else:
                    winner = "="
            else:
                winner = "="

        print(f"{metric:<25} {str_a:<20} {str_b:<20} {winner}")

    print("-" * 70)

    # Timing if available
    if timing:
        time_a = timing.get("time_A", "N/A")
        time_b = timing.get("time_B", "N/A")
        if isinstance(time_a, (int, float)) and isinstance(time_b, (int, float)):
            winner = "A" if time_a < time_b else "B" if time_b < time_a else "="
            print(f"{'execution_time (s)':<25} {time_a:<20.2f} {time_b:<20.2f} {winner}")
            if time_a < time_b:
                scores["A"] += 1
            elif time_b < time_a:
                scores["B"] += 1
        print("-" * 70)

    print(f"\n{'SCORE':<25} {scores['A']:<20} {scores['B']:<20}")
    print()

    return scores


def interpret_results(metrics_a: dict, metrics_b: dict, scores: dict):
    """Print interpretation."""
    print("=" * 70)
    print("INTERPRETATION")
    print("=" * 70)

    winner = "A (Curved)" if scores["A"] > scores["B"] else "B (Straight-Line)" if scores["B"] > scores["A"] else "Tie"

    print(f"\nOverall Winner: {winner}")
    print()

    # Energy efficiency analysis
    energy_a = metrics_a.get("chars_out", 0) + (metrics_a.get("novelty_rate", 0) * 1000) + (metrics_a.get("frame_switches", 0) * 100)
    energy_b = metrics_b.get("chars_out", 0) + (metrics_b.get("novelty_rate", 0) * 1000) + (metrics_b.get("frame_switches", 0) * 100)

    print("Energy Proxy (chars + novelty*1000 + frame_switches*100):")
    print(f"  A (Curved):       {energy_a:.0f}")
    print(f"  B (Straight):     {energy_b:.0f}")
    print(f"  Efficiency gain:  {((energy_a - energy_b) / max(1, energy_a)) * 100:.1f}%")
    print()

    # Analysis
    print("Analysis:")

    if metrics_b.get("anchor_preservation", 0) > metrics_a.get("anchor_preservation", 0):
        print("  - B preserves anchor better (invariant maintained)")

    if metrics_b.get("novelty_rate", 1) < metrics_a.get("novelty_rate", 1):
        print("  - B introduces fewer new terms (less semantic drift)")

    if metrics_b.get("frame_switches", 0) < metrics_a.get("frame_switches", 0):
        print("  - B has fewer frame switches (straighter trajectory)")

    if metrics_b.get("ambiguity_rate", 0) < metrics_a.get("ambiguity_rate", 0):
        print("  - B uses less hedge language (higher certainty)")

    if metrics_b.get("chars_out", 0) < metrics_a.get("chars_out", 0):
        print("  - B produces shorter output (more compressed)")

    if metrics_a.get("citations_count", 0) < metrics_b.get("citations_count", 0):
        print("  - B has more citations (better grounding)")

    print()
    print("Conclusion:")
    if energy_b < energy_a:
        print("  Straight-line traversal (B) is more energy-efficient.")
        print("  It achieves the goal with less output, fewer novel terms,")
        print("  and maintains tighter alignment with the invariant anchor.")
    else:
        print("  Curved traversal (A) used less energy in this run,")
        print("  but may have sacrificed invariant preservation.")

    print()


def main():
    # Read outputs
    text_a = read_output("out_A.txt")
    text_b = read_output("out_B.txt")

    if not text_a and not text_b:
        print("ERROR: No output files found.")
        print("Run: bash cog_exp/run_experiment.sh")
        return 1

    # Compute metrics
    metrics_a = compute_metrics(text_a, "A")
    metrics_b = compute_metrics(text_b, "B")

    # Load timing
    timing = load_timing()

    # Print table
    scores = print_table(metrics_a, metrics_b, timing)

    # Interpretation
    interpret_results(metrics_a, metrics_b, scores)

    # Save results
    results = {
        "anchor": ANCHOR,
        "metrics_A": metrics_a,
        "metrics_B": metrics_b,
        "timing": timing,
        "scores": scores
    }

    results_path = os.path.join(SCRIPT_DIR, "results.json")
    with open(results_path, "w") as f:
        json.dump(results, f, indent=2)

    print(f"Results saved to: {results_path}")
    return 0


if __name__ == "__main__":
    exit(main())
