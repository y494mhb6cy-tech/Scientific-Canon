#!/usr/bin/env python3
"""
dev.reasoning.py — Portable reasoning policy enforcement tool

Drop this file + dev.reasoning.policy.yaml into any repo to enable:
  - Straight-line (invariant-preserving) reasoning
  - Curved (exploratory) reasoning
  - Energy/efficiency measurement
  - Automated policy validation

Usage:
  python dev.reasoning.py --anchor "your invariant" [options]
  python dev.reasoning.py --policy dev.reasoning.policy.yaml [options]
  python dev.reasoning.py analyze output.txt --anchor "your invariant"
  python dev.reasoning.py compare a.txt b.txt --anchor "your invariant"

Examples:
  # Analyze a file against an anchor
  python dev.reasoning.py analyze response.txt --anchor "operators create identity"

  # Generate prompt for straight-line mode
  python dev.reasoning.py prompt --anchor "X" --mode straight_line

  # Compare two outputs
  python dev.reasoning.py compare curved.txt straight.txt --anchor "X"

  # Index repo and find best chain
  python dev.reasoning.py traverse . --anchor "X" --steps 6
"""

import argparse
import json
import math
import os
import re
import sys
from collections import Counter
from typing import Dict, List, Optional, Set, Tuple

# ============================================================================
# DEFAULT CONFIGURATION (used if no policy file provided)
# ============================================================================

DEFAULT_CONFIG = {
    "scoring": {
        "anchor_alignment_weight": 0.65,
        "novelty_penalty_weight": 0.25,
        "ambiguity_penalty_weight": 0.10,
        "thresholds": {
            "score_minimum": 0.02,
            "novelty_maximum": 0.80,
            "ambiguity_maximum": 0.50
        }
    },
    "vocabulary": {
        "hedge_words": [
            "maybe", "might", "could", "depends", "unclear", "uncertain",
            "perhaps", "arguably", "possibly", "probably", "sometimes", "often"
        ],
        "frame_switch_markers": [
            "however", "on the other hand", "alternatively", "another perspective",
            "conversely", "in contrast", "that said", "then again"
        ],
        "stopwords": [
            "a", "an", "and", "are", "as", "at", "be", "but", "by", "for",
            "if", "in", "into", "is", "it", "its", "of", "on", "or", "that",
            "the", "their", "then", "there", "these", "this", "to", "was",
            "were", "will", "with", "would", "can", "did", "do", "does",
            "had", "has", "have", "how", "may", "must", "no", "not", "shall",
            "should", "very", "what", "when", "where", "which", "who", "why",
            "you", "your"
        ]
    },
    "output": {
        "chain": {
            "min_steps": 1,
            "max_steps": 10,
            "default_steps": 6
        }
    }
}


# ============================================================================
# CORE FUNCTIONS
# ============================================================================

def load_policy(path: str) -> dict:
    """Load policy from YAML file."""
    try:
        import yaml
        with open(path, 'r') as f:
            return yaml.safe_load(f)
    except ImportError:
        # Fallback: basic YAML parsing for simple cases
        config = DEFAULT_CONFIG.copy()
        with open(path, 'r') as f:
            content = f.read()
            # Extract anchor if present
            match = re.search(r'anchor:\s*\n\s*text:\s*["\'](.+?)["\']', content)
            if match:
                config['anchor'] = {'text': match.group(1)}
        return config
    except FileNotFoundError:
        print(f"Warning: Policy file not found: {path}", file=sys.stderr)
        return DEFAULT_CONFIG


def get_stopwords(config: dict) -> Set[str]:
    """Get stopwords from config."""
    return set(config.get('vocabulary', {}).get('stopwords', DEFAULT_CONFIG['vocabulary']['stopwords']))


def get_hedge_words(config: dict) -> List[str]:
    """Get hedge words from config."""
    return config.get('vocabulary', {}).get('hedge_words', DEFAULT_CONFIG['vocabulary']['hedge_words'])


def get_frame_markers(config: dict) -> List[str]:
    """Get frame switch markers from config."""
    return config.get('vocabulary', {}).get('frame_switch_markers', DEFAULT_CONFIG['vocabulary']['frame_switch_markers'])


def tokenize(text: str, stopwords: Set[str]) -> List[str]:
    """Extract meaningful tokens from text."""
    words = re.findall(r"[A-Za-z][A-Za-z0-9_\-']+", text.lower())
    return [w for w in words if w not in stopwords and len(w) > 2]


def term_frequency(tokens: List[str]) -> Dict[str, float]:
    """Compute normalized term frequency."""
    counter = Counter(tokens)
    total = sum(counter.values()) or 1
    return {k: v / total for k, v in counter.items()}


def cosine_similarity(a: Dict[str, float], b: Dict[str, float]) -> float:
    """Compute cosine similarity between two TF vectors."""
    keys = set(a) | set(b)
    dot = sum(a.get(k, 0) * b.get(k, 0) for k in keys)
    norm_a = math.sqrt(sum(v * v for v in a.values())) or 1.0
    norm_b = math.sqrt(sum(v * v for v in b.values())) or 1.0
    return dot / (norm_a * norm_b)


def novelty_penalty(anchor_vocab: Set[str], text_vocab: Set[str]) -> float:
    """Compute novelty penalty: fraction of text vocab not in anchor."""
    if not text_vocab:
        return 1.0
    new_terms = text_vocab - anchor_vocab
    return len(new_terms) / len(text_vocab)


def ambiguity_rate(text: str, hedge_words: List[str], word_count: int) -> float:
    """Compute ambiguity rate: hedge words per 100 words."""
    text_lower = text.lower()
    hedge_count = sum(text_lower.count(h) for h in hedge_words)
    return (hedge_count / max(1, word_count)) * 100


def frame_switch_count(text: str, markers: List[str]) -> int:
    """Count frame switch markers in text."""
    text_lower = text.lower()
    return sum(text_lower.count(m) for m in markers)


def citation_count(text: str) -> int:
    """Count citations (file references)."""
    # Match patterns like [file.md > Heading] or file.md
    md_refs = len(re.findall(r'\w+\.\w+', text))
    bracket_refs = len(re.findall(r'\[.+?\]', text))
    return md_refs + bracket_refs


def step_count(text: str) -> int:
    """Count steps in output."""
    matches = re.findall(r'Step\s+(\d+)', text, re.IGNORECASE)
    return max([int(s) for s in matches]) if matches else 0


def anchor_preservation(text: str, anchor: str) -> int:
    """Count exact anchor occurrences in text."""
    return text.lower().count(anchor.lower())


def compute_energy(metrics: dict) -> float:
    """Compute energy proxy from metrics."""
    return (
        metrics.get('chars_out', 0) +
        (metrics.get('novelty_rate', 0) * 1000) +
        (metrics.get('frame_switches', 0) * 100) +
        (metrics.get('ambiguity_rate', 0) * 500)
    )


# ============================================================================
# ANALYSIS FUNCTIONS
# ============================================================================

def analyze_text(text: str, anchor: str, config: dict = None) -> dict:
    """Analyze text against anchor and compute all metrics."""
    if config is None:
        config = DEFAULT_CONFIG

    stopwords = get_stopwords(config)
    hedge_words = get_hedge_words(config)
    frame_markers = get_frame_markers(config)

    # Tokenize
    anchor_tokens = tokenize(anchor, stopwords)
    anchor_vocab = set(anchor_tokens)
    anchor_tf = term_frequency(anchor_tokens)

    text_tokens = tokenize(text, stopwords)
    text_vocab = set(text_tokens)
    text_tf = term_frequency(text_tokens)

    words = text.split()
    word_count = len(words)

    # Compute metrics
    metrics = {
        'chars_out': len(text),
        'words_out': word_count,
        'anchor_preservation': anchor_preservation(text, anchor),
        'citations_count': citation_count(text),
        'step_count': step_count(text),
        'anchor_alignment': round(cosine_similarity(anchor_tf, text_tf), 4),
        'novelty_rate': round(novelty_penalty(anchor_vocab, text_vocab), 4),
        'ambiguity_rate': round(ambiguity_rate(text, hedge_words, word_count), 4),
        'frame_switches': frame_switch_count(text, frame_markers),
        'unique_tokens': len(text_vocab),
        'anchor_tokens_used': len(anchor_vocab & text_vocab),
        'anchor_tokens_total': len(anchor_vocab)
    }

    # Compute composite score
    scoring = config.get('scoring', DEFAULT_CONFIG['scoring'])
    metrics['score'] = round(
        (scoring['anchor_alignment_weight'] * metrics['anchor_alignment']) -
        (scoring['novelty_penalty_weight'] * metrics['novelty_rate']) -
        (scoring['ambiguity_penalty_weight'] * (metrics['ambiguity_rate'] / 100)),
        4
    )

    # Compute energy
    metrics['energy'] = round(compute_energy(metrics), 2)

    return metrics


def validate_output(text: str, anchor: str, mode: str, config: dict = None) -> dict:
    """Validate output against policy rules."""
    metrics = analyze_text(text, anchor, config)
    config = config or DEFAULT_CONFIG
    thresholds = config.get('scoring', {}).get('thresholds', DEFAULT_CONFIG['scoring']['thresholds'])

    violations = []
    warnings = []

    if mode == 'straight_line':
        # §1: Invariant First
        if metrics['anchor_preservation'] < 1:
            violations.append("§1 INVARIANT_FIRST: Anchor not found verbatim in output")

        # §2: No New Frames
        if metrics['novelty_rate'] > thresholds['novelty_maximum']:
            violations.append(f"§2 NO_NEW_FRAMES: novelty_rate {metrics['novelty_rate']:.2f} > {thresholds['novelty_maximum']}")

        # §3: Ambiguity
        if metrics['ambiguity_rate'] > thresholds['ambiguity_maximum']:
            warnings.append(f"§3 AMBIGUITY: ambiguity_rate {metrics['ambiguity_rate']:.2f} > {thresholds['ambiguity_maximum']}")

        # §5: Frame Switches
        if metrics['frame_switches'] > 0:
            violations.append(f"§5 NO_FRAME_SWITCHES: Found {metrics['frame_switches']} frame switch markers")

    return {
        'valid': len(violations) == 0,
        'violations': violations,
        'warnings': warnings,
        'metrics': metrics
    }


# ============================================================================
# REPO TRAVERSAL (from drs.py)
# ============================================================================

def read_files(root: str, extensions: List[str] = None) -> List[str]:
    """Find all matching files in directory tree."""
    if extensions is None:
        extensions = ['.md', '.txt', '.rst']

    paths = []
    for dirpath, _, filenames in os.walk(root):
        # Skip hidden directories (but not . or ..)
        parts = [p for p in dirpath.split(os.sep) if p and p not in ('.', '..')]
        if any(part.startswith('.') for part in parts):
            continue
        for fn in filenames:
            if any(fn.lower().endswith(ext) for ext in extensions):
                paths.append(os.path.join(dirpath, fn))
    return sorted(paths)


def chunk_file(path: str) -> List[Tuple[str, str]]:
    """Split file into chunks by heading."""
    try:
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            text = f.read()
    except IOError:
        return []

    # Split by markdown headings
    parts = re.split(r'(?m)^(#{1,6}\s+.+)$', text)
    chunks = []

    if parts:
        pre = parts[0].strip()
        if pre and len(pre) > 50:
            chunks.append(('Preamble', pre))

        i = 1
        while i < len(parts) - 1:
            heading = parts[i].strip()
            body = parts[i + 1].strip()
            if body and len(body) > 30:
                chunks.append((heading, body))
            i += 2

    return chunks


def build_index(repo_root: str, config: dict = None) -> List[dict]:
    """Build searchable index of repo content."""
    config = config or DEFAULT_CONFIG
    stopwords = get_stopwords(config)

    entries = []
    for path in read_files(repo_root):
        rel_path = os.path.relpath(path, repo_root)
        chunks = chunk_file(path)

        for heading, body in chunks:
            tokens = tokenize(heading + "\n" + body, stopwords)
            if not tokens:
                continue

            entries.append({
                'path': rel_path,
                'heading': heading,
                'body': body,
                'tf': term_frequency(tokens),
                'vocab': set(tokens)
            })

    return entries


def traverse(entries: List[dict], anchor: str, max_steps: int = 6, config: dict = None) -> List[dict]:
    """Build linear chain through repo content."""
    config = config or DEFAULT_CONFIG
    stopwords = get_stopwords(config)
    scoring = config.get('scoring', DEFAULT_CONFIG['scoring'])
    threshold = scoring.get('thresholds', {}).get('score_minimum', 0.02)

    anchor_tokens = tokenize(anchor, stopwords)
    anchor_vocab = set(anchor_tokens)
    anchor_tf = term_frequency(anchor_tokens)

    used = set()
    chain = []

    for step in range(max_steps):
        best = None
        best_score = -float('inf')

        for idx, entry in enumerate(entries):
            if idx in used:
                continue

            align = cosine_similarity(anchor_tf, entry['tf'])
            novelty = novelty_penalty(anchor_vocab, entry['vocab'])
            amb = ambiguity_rate(entry['body'], get_hedge_words(config), len(entry['body'].split())) / 100

            score = (
                (scoring['anchor_alignment_weight'] * align) -
                (scoring['novelty_penalty_weight'] * novelty) -
                (scoring['ambiguity_penalty_weight'] * amb)
            )

            if score > best_score:
                best_score = score
                best = (idx, entry, align, novelty, amb, score)

        if not best or best_score < threshold:
            break

        idx, entry, align, novelty, amb, score = best
        used.add(idx)

        chain.append({
            'step': step + 1,
            'path': entry['path'],
            'heading': entry['heading'],
            'metrics': {
                'alignment': round(align, 4),
                'novelty': round(novelty, 4),
                'ambiguity': round(amb, 4),
                'score': round(score, 4)
            }
        })

    return chain


# ============================================================================
# PROMPT GENERATION
# ============================================================================

def generate_prompt(anchor: str, mode: str = 'straight_line', steps: int = 6) -> str:
    """Generate prompt for specified mode."""
    if mode == 'straight_line':
        return f'''ANCHOR: "{anchor}"

RULES (Dimensional Reference Script):
1. INVARIANT FIRST: Begin by restating the anchor exactly.
2. NO NEW PRIMITIVES: Use only terms from the anchor vocabulary.
3. NO NEW FRAMES: Do not introduce alternative perspectives.
4. CITE EVERY STEP: Each step must cite [file > heading].
5. PREFER ANCHOR TERMS: Select content that reuses anchor words.
6. STOP ON CLOSURE: If next step requires new terms, stop.
7. COMPRESS: End with 2 sentences containing anchor verbatim.

Forbidden: however, alternatively, might, maybe, could, perhaps

FORMAT:
ANCHOR: "{anchor}"
Step 1: [source > heading] - statement using anchor terms
...
Step {steps}: ...
COMPRESSION: [2 sentences with anchor verbatim]'''

    else:  # curved
        return f'''CONCEPT: "{anchor}"

Explore this concept freely:
- You may paraphrase and reframe
- Make insightful connections
- Introduce related ideas
- Be creative and exploratory

FORMAT:
Step 1: [source > heading] - your insight
...
Step {steps}: ...
SUMMARY: [your synthesis]'''


# ============================================================================
# CLI INTERFACE
# ============================================================================

def cmd_analyze(args):
    """Analyze command."""
    with open(args.file, 'r') as f:
        text = f.read()

    config = load_policy(args.policy) if args.policy else DEFAULT_CONFIG
    metrics = analyze_text(text, args.anchor, config)

    print(f"\nAnalysis: {args.file}")
    print(f"Anchor: \"{args.anchor}\"")
    print("-" * 50)
    for k, v in metrics.items():
        print(f"{k:<25} {v}")
    print("-" * 50)


def cmd_validate(args):
    """Validate command."""
    with open(args.file, 'r') as f:
        text = f.read()

    config = load_policy(args.policy) if args.policy else DEFAULT_CONFIG
    result = validate_output(text, args.anchor, args.mode, config)

    print(f"\nValidation: {args.file}")
    print(f"Mode: {args.mode}")
    print(f"Anchor: \"{args.anchor}\"")
    print("-" * 50)
    print(f"Valid: {result['valid']}")

    if result['violations']:
        print("\nViolations:")
        for v in result['violations']:
            print(f"  - {v}")

    if result['warnings']:
        print("\nWarnings:")
        for w in result['warnings']:
            print(f"  - {w}")

    print("\nMetrics:")
    for k, v in result['metrics'].items():
        print(f"  {k:<23} {v}")


def cmd_compare(args):
    """Compare two outputs."""
    with open(args.file_a, 'r') as f:
        text_a = f.read()
    with open(args.file_b, 'r') as f:
        text_b = f.read()

    config = load_policy(args.policy) if args.policy else DEFAULT_CONFIG
    metrics_a = analyze_text(text_a, args.anchor, config)
    metrics_b = analyze_text(text_b, args.anchor, config)

    print(f"\nComparison: {args.file_a} vs {args.file_b}")
    print(f"Anchor: \"{args.anchor}\"")
    print("=" * 70)
    print(f"{'Metric':<25} {'A':<20} {'B':<20} {'Winner'}")
    print("-" * 70)

    prefer_lower = ['chars_out', 'words_out', 'novelty_rate', 'ambiguity_rate', 'frame_switches', 'unique_tokens', 'energy']
    prefer_higher = ['anchor_preservation', 'citations_count', 'anchor_alignment', 'anchor_tokens_used', 'score']

    scores = {'A': 0, 'B': 0}

    for key in metrics_a:
        va, vb = metrics_a[key], metrics_b[key]
        winner = ''

        if key in prefer_lower:
            if va < vb:
                winner = 'A'
                scores['A'] += 1
            elif vb < va:
                winner = 'B'
                scores['B'] += 1
        elif key in prefer_higher:
            if va > vb:
                winner = 'A'
                scores['A'] += 1
            elif vb > va:
                winner = 'B'
                scores['B'] += 1

        print(f"{key:<25} {str(va):<20} {str(vb):<20} {winner}")

    print("-" * 70)
    print(f"{'SCORE':<25} {scores['A']:<20} {scores['B']:<20}")

    overall = 'A' if scores['A'] > scores['B'] else 'B' if scores['B'] > scores['A'] else 'Tie'
    print(f"\nWinner: {overall}")

    efficiency = ((metrics_a['energy'] - metrics_b['energy']) / max(1, metrics_a['energy'])) * 100
    print(f"Energy efficiency (B vs A): {efficiency:.1f}%")


def cmd_prompt(args):
    """Generate prompt."""
    prompt = generate_prompt(args.anchor, args.mode, args.steps)
    print(prompt)


def cmd_traverse(args):
    """Traverse repo."""
    config = load_policy(args.policy) if args.policy else DEFAULT_CONFIG

    print(f"Indexing: {args.repo}", file=sys.stderr)
    entries = build_index(args.repo, config)
    print(f"Found {len(entries)} chunks", file=sys.stderr)

    chain = traverse(entries, args.anchor, args.steps, config)

    result = {
        'anchor': args.anchor,
        'chain_length': len(chain),
        'chain': chain
    }

    print(json.dumps(result, indent=2))


def main():
    parser = argparse.ArgumentParser(
        description='Reasoning policy enforcement tool',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument('--policy', '-p', help='Policy YAML file')
    parser.add_argument('--anchor', '-a', help='Invariant anchor text')

    subparsers = parser.add_subparsers(dest='command')

    # analyze
    p_analyze = subparsers.add_parser('analyze', help='Analyze text against anchor')
    p_analyze.add_argument('file', help='File to analyze')

    # validate
    p_validate = subparsers.add_parser('validate', help='Validate output against policy')
    p_validate.add_argument('file', help='File to validate')
    p_validate.add_argument('--mode', '-m', default='straight_line', choices=['straight_line', 'curved'])

    # compare
    p_compare = subparsers.add_parser('compare', help='Compare two outputs')
    p_compare.add_argument('file_a', help='First file')
    p_compare.add_argument('file_b', help='Second file')

    # prompt
    p_prompt = subparsers.add_parser('prompt', help='Generate prompt for mode')
    p_prompt.add_argument('--mode', '-m', default='straight_line', choices=['straight_line', 'curved'])
    p_prompt.add_argument('--steps', '-s', type=int, default=6)

    # traverse
    p_traverse = subparsers.add_parser('traverse', help='Traverse repo for anchor')
    p_traverse.add_argument('repo', help='Repository root')
    p_traverse.add_argument('--steps', '-s', type=int, default=6)

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return 1

    if args.command in ['analyze', 'validate', 'compare', 'prompt', 'traverse'] and not args.anchor:
        print("Error: --anchor required", file=sys.stderr)
        return 1

    commands = {
        'analyze': cmd_analyze,
        'validate': cmd_validate,
        'compare': cmd_compare,
        'prompt': cmd_prompt,
        'traverse': cmd_traverse
    }

    return commands[args.command](args)


if __name__ == '__main__':
    sys.exit(main() or 0)
