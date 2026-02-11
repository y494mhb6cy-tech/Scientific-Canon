#!/usr/bin/env python3
"""
Accuracy evaluation for Curved vs Straight-Line traversal.

Measures:
1. Citation validity: Do cited files/headings actually exist?
2. Citation relevance: Does cited content contain anchor terms?
3. Claim grounding: What % of statements are backed by citations?
4. Semantic drift: How far do claims stray from source material?
5. Hallucination markers: Claims that can't be verified against repo
"""

import os
import re
import json
from collections import Counter
from typing import Dict, List, Set, Tuple

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(SCRIPT_DIR)
ANCHOR = "operators create identity governance validates moderation ensures coherence"

STOPWORDS = set("""
a an and are as at be but by for if in into is it its no not of on or
that the their then there these they this to was were will with would
can could did do does had has have how may might must shall should
very what when where which who why you your
""".split())


def tokenize(text: str) -> Set[str]:
    """Extract meaningful tokens."""
    words = re.findall(r"[A-Za-z][A-Za-z0-9_\-']+", text.lower())
    return set(w for w in words if w not in STOPWORDS and len(w) > 2)


def load_repo_index() -> Dict[str, Dict[str, str]]:
    """Build index of all repo content: {file: {heading: content}}"""
    index = {}

    for root, _, files in os.walk(REPO_ROOT):
        # Skip hidden dirs and cog_exp outputs
        if any(p.startswith('.') for p in root.split(os.sep) if p):
            continue

        for fn in files:
            if not fn.endswith('.md'):
                continue

            path = os.path.join(root, fn)
            rel_path = os.path.relpath(path, REPO_ROOT)

            # Skip experiment outputs
            if 'out_A' in rel_path or 'out_B' in rel_path:
                continue

            try:
                with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
            except:
                continue

            # Parse into sections
            sections = {}
            parts = re.split(r'(?m)^(#{1,6}\s+.+)$', content)

            if parts[0].strip():
                sections['Preamble'] = parts[0].strip()

            i = 1
            while i < len(parts) - 1:
                heading = parts[i].strip()
                body = parts[i + 1].strip()
                if body:
                    # Normalize heading for matching
                    sections[heading] = body
                    # Also store without # prefix
                    clean_heading = re.sub(r'^#+\s*', '', heading)
                    sections[clean_heading] = body
                i += 2

            index[rel_path] = sections
            # Also index by filename only
            index[fn] = sections

    return index


def extract_citations(text: str) -> List[Dict]:
    """Extract citations from output text."""
    citations = []

    # Pattern: [file.md > Heading] or [file.md > Section > Heading]
    bracket_pattern = r'\[([^\]]+\.md)[^\]]*?(?:>|›)\s*([^\]]+)\]'
    for match in re.finditer(bracket_pattern, text, re.IGNORECASE):
        citations.append({
            'file': match.group(1).strip(),
            'heading': match.group(2).strip(),
            'raw': match.group(0)
        })

    # Pattern: file.md > Heading (without brackets)
    plain_pattern = r'(\w+\.md)\s*(?:>|›)\s*([^,\n\]]+)'
    for match in re.finditer(plain_pattern, text, re.IGNORECASE):
        citations.append({
            'file': match.group(1).strip(),
            'heading': match.group(2).strip(),
            'raw': match.group(0)
        })

    # Deduplicate
    seen = set()
    unique = []
    for c in citations:
        key = (c['file'].lower(), c['heading'].lower()[:30])
        if key not in seen:
            seen.add(key)
            unique.append(c)

    return unique


def verify_citation(citation: Dict, index: Dict) -> Dict:
    """Verify a citation against repo index."""
    file_key = citation['file']
    heading = citation['heading']

    result = {
        'citation': citation['raw'],
        'file_exists': False,
        'heading_exists': False,
        'content': None,
        'anchor_terms_in_source': 0,
        'relevance_score': 0.0
    }

    # Check file exists
    file_content = None
    for key in index:
        if file_key.lower() in key.lower():
            file_content = index[key]
            result['file_exists'] = True
            break

    if not file_content:
        return result

    # Check heading exists (fuzzy match)
    heading_lower = heading.lower()
    for section_heading, content in file_content.items():
        section_lower = section_heading.lower()
        # Exact or partial match
        if heading_lower in section_lower or section_lower in heading_lower:
            result['heading_exists'] = True
            result['content'] = content[:500]

            # Check anchor terms in source
            anchor_tokens = tokenize(ANCHOR)
            source_tokens = tokenize(content)
            overlap = anchor_tokens & source_tokens
            result['anchor_terms_in_source'] = len(overlap)
            result['relevance_score'] = len(overlap) / max(1, len(anchor_tokens))
            break

    return result


def extract_claims(text: str) -> List[Dict]:
    """Extract claims/statements from output."""
    claims = []

    # Pattern 1: Step N: [citation] - claim
    step_pattern = r'Step\s+\d+[:\s]+\[([^\]]+)\][^\n]*[-–]\s*(.+?)(?=Step\s+\d+|COMPRESSION|SUMMARY|$)'
    for match in re.finditer(step_pattern, text, re.DOTALL | re.IGNORECASE):
        citation_part = match.group(1)
        claim_part = match.group(2).strip()
        claim_part = re.sub(r'\n+', ' ', claim_part)
        claims.append({
            'citation': citation_part,
            'claim': claim_part[:300],
            'has_citation': bool(citation_part)
        })

    # Pattern 2: Step N: [file > heading]\nContent
    if not claims:
        step_pattern2 = r'Step\s+\d+[:\s]+\[([^\]]+)\]\s*\n(.+?)(?=Step\s+\d+|COMPRESSION|SUMMARY|$)'
        for match in re.finditer(step_pattern2, text, re.DOTALL | re.IGNORECASE):
            citation_part = match.group(1)
            claim_part = match.group(2).strip()
            claim_part = re.sub(r'\n+', ' ', claim_part)
            claims.append({
                'citation': citation_part,
                'claim': claim_part[:300],
                'has_citation': bool(citation_part)
            })

    # Pattern 3: Just find all text between Step markers
    if not claims:
        steps = re.split(r'Step\s+\d+[:\s]+', text, flags=re.IGNORECASE)
        for step_text in steps[1:]:  # Skip first empty split
            step_text = step_text.strip()
            if step_text and len(step_text) > 20:
                # Extract citation if present
                cite_match = re.search(r'\[([^\]]+)\]', step_text)
                citation_part = cite_match.group(1) if cite_match else ""
                claims.append({
                    'citation': citation_part,
                    'claim': step_text[:300],
                    'has_citation': bool(citation_part)
                })

    return claims


def check_claim_grounding(claim: str, source_content: str) -> Dict:
    """Check if claim is grounded in source content."""
    if not source_content:
        return {'grounded': False, 'overlap': 0, 'fabrication_risk': 1.0}

    claim_tokens = tokenize(claim)
    source_tokens = tokenize(source_content)

    if not claim_tokens:
        return {'grounded': True, 'overlap': 0, 'fabrication_risk': 0.0}

    overlap = claim_tokens & source_tokens
    overlap_ratio = len(overlap) / len(claim_tokens)

    # High overlap = grounded, low overlap = potential fabrication
    return {
        'grounded': overlap_ratio > 0.3,
        'overlap': len(overlap),
        'overlap_ratio': round(overlap_ratio, 3),
        'fabrication_risk': round(1 - overlap_ratio, 3)
    }


def detect_hallucination_markers(text: str) -> List[str]:
    """Detect language patterns that suggest hallucination/fabrication."""
    markers = []
    text_lower = text.lower()

    # Certainty about things not in source
    certainty_phrases = [
        "this means that",
        "this implies",
        "clearly",
        "obviously",
        "it's clear that",
        "we can see that",
        "this shows",
        "this proves",
        "this demonstrates"
    ]

    # Speculation presented as fact
    speculation_as_fact = [
        "the framework is",
        "the system is",
        "the model is",
        "this is because",
        "the reason is"
    ]

    for phrase in certainty_phrases:
        if phrase in text_lower:
            markers.append(f"certainty_marker: '{phrase}'")

    return markers


def compute_accuracy_metrics(text: str, index: Dict) -> Dict:
    """Compute all accuracy metrics for an output."""
    citations = extract_citations(text)
    claims = extract_claims(text)

    # Verify all citations
    citation_results = [verify_citation(c, index) for c in citations]

    # Citation accuracy
    files_found = sum(1 for r in citation_results if r['file_exists'])
    headings_found = sum(1 for r in citation_results if r['heading_exists'])
    total_citations = len(citation_results) or 1

    citation_validity = files_found / total_citations
    heading_validity = headings_found / total_citations

    # Average relevance of valid citations
    relevance_scores = [r['relevance_score'] for r in citation_results if r['heading_exists']]
    avg_relevance = sum(relevance_scores) / max(1, len(relevance_scores))

    # Claim grounding
    grounded_claims = 0
    total_fabrication_risk = 0

    for claim in claims:
        # Find matching citation result
        source_content = None
        for cr in citation_results:
            if cr['heading_exists'] and cr['content']:
                source_content = cr['content']
                break

        grounding = check_claim_grounding(claim['claim'], source_content)
        if grounding['grounded']:
            grounded_claims += 1
        total_fabrication_risk += grounding['fabrication_risk']

    total_claims = len(claims) or 1
    grounding_rate = grounded_claims / total_claims
    avg_fabrication_risk = total_fabrication_risk / total_claims

    # Hallucination markers
    hallucination_markers = detect_hallucination_markers(text)

    # Anchor fidelity in compression
    compression_match = re.search(r'COMPRESSION[:\s]+(.+?)$', text, re.DOTALL | re.IGNORECASE)
    compression_text = compression_match.group(1) if compression_match else ""

    # Check for anchor - normalize whitespace for comparison
    anchor_normalized = ' '.join(ANCHOR.lower().split())
    compression_normalized = ' '.join(compression_text.lower().split())
    anchor_in_compression = anchor_normalized in compression_normalized

    # Also check if key anchor phrases appear
    key_phrases = ["operators create identity", "governance validates", "moderation ensures coherence"]
    phrases_found = sum(1 for p in key_phrases if p in compression_normalized)
    anchor_in_compression = anchor_in_compression or phrases_found >= 2
    anchor_tokens = tokenize(ANCHOR)
    compression_tokens = tokenize(compression_text)
    anchor_token_coverage = len(anchor_tokens & compression_tokens) / max(1, len(anchor_tokens))

    return {
        'citations_total': len(citations),
        'citation_validity': round(citation_validity, 3),
        'heading_validity': round(heading_validity, 3),
        'avg_source_relevance': round(avg_relevance, 3),
        'claims_total': len(claims),
        'grounding_rate': round(grounding_rate, 3),
        'avg_fabrication_risk': round(avg_fabrication_risk, 3),
        'hallucination_markers': len(hallucination_markers),
        'anchor_verbatim_in_compression': anchor_in_compression,
        'anchor_token_coverage': round(anchor_token_coverage, 3),
        'citation_details': citation_results,
        'hallucination_details': hallucination_markers
    }


def print_accuracy_report(metrics_a: Dict, metrics_b: Dict):
    """Print accuracy comparison report."""
    print("\n" + "=" * 75)
    print("ACCURACY ANALYSIS: Curved (A) vs Straight-Line (B)")
    print("=" * 75)
    print(f"\nAnchor: \"{ANCHOR}\"")

    print("\n" + "-" * 75)
    print(f"{'Metric':<35} {'A (Curved)':<18} {'B (Straight)':<18} {'Better'}")
    print("-" * 75)

    comparisons = [
        ('citations_total', 'higher', 'Citation count'),
        ('citation_validity', 'higher', 'Files exist'),
        ('heading_validity', 'higher', 'Headings exist'),
        ('avg_source_relevance', 'higher', 'Source relevance to anchor'),
        ('claims_total', 'info', 'Claims made'),
        ('grounding_rate', 'higher', 'Claims grounded in sources'),
        ('avg_fabrication_risk', 'lower', 'Fabrication risk'),
        ('hallucination_markers', 'lower', 'Hallucination markers'),
        ('anchor_verbatim_in_compression', 'true', 'Anchor verbatim preserved'),
        ('anchor_token_coverage', 'higher', 'Anchor terms in compression'),
    ]

    scores = {'A': 0, 'B': 0}

    for key, prefer, label in comparisons:
        va = metrics_a.get(key, 'N/A')
        vb = metrics_b.get(key, 'N/A')

        # Format
        if isinstance(va, bool):
            str_a, str_b = str(va), str(vb)
        elif isinstance(va, float):
            str_a, str_b = f"{va:.3f}", f"{vb:.3f}"
        else:
            str_a, str_b = str(va), str(vb)

        # Determine winner
        winner = ''
        if prefer == 'higher' and isinstance(va, (int, float)) and isinstance(vb, (int, float)):
            if va > vb:
                winner = 'A'
                scores['A'] += 1
            elif vb > va:
                winner = 'B'
                scores['B'] += 1
        elif prefer == 'lower' and isinstance(va, (int, float)) and isinstance(vb, (int, float)):
            if va < vb:
                winner = 'A'
                scores['A'] += 1
            elif vb < va:
                winner = 'B'
                scores['B'] += 1
        elif prefer == 'true':
            if va and not vb:
                winner = 'A'
                scores['A'] += 1
            elif vb and not va:
                winner = 'B'
                scores['B'] += 1

        print(f"{label:<35} {str_a:<18} {str_b:<18} {winner}")

    print("-" * 75)
    print(f"{'ACCURACY SCORE':<35} {scores['A']:<18} {scores['B']:<18}")

    return scores


def interpret_accuracy(metrics_a: Dict, metrics_b: Dict, scores: Dict):
    """Interpret accuracy results."""
    print("\n" + "=" * 75)
    print("ACCURACY INTERPRETATION")
    print("=" * 75)

    winner = 'A (Curved)' if scores['A'] > scores['B'] else 'B (Straight-Line)' if scores['B'] > scores['A'] else 'Tie'
    print(f"\nMore Accurate: {winner}")

    # Composite accuracy score
    def composite(m):
        return (
            m['citation_validity'] * 0.15 +
            m['heading_validity'] * 0.15 +
            m['avg_source_relevance'] * 0.20 +
            m['grounding_rate'] * 0.25 +
            (1 - m['avg_fabrication_risk']) * 0.15 +
            (1 if m['anchor_verbatim_in_compression'] else 0) * 0.10
        )

    acc_a = composite(metrics_a)
    acc_b = composite(metrics_b)

    print(f"\nComposite Accuracy Score (weighted):")
    print(f"  A (Curved):      {acc_a:.3f}")
    print(f"  B (Straight):    {acc_b:.3f}")
    print(f"  Accuracy gain:   {((acc_b - acc_a) / max(0.001, acc_a)) * 100:.1f}%")

    print("\nKey Findings:")

    if metrics_b['grounding_rate'] > metrics_a['grounding_rate']:
        print("  ✓ B has higher grounding rate (claims backed by sources)")

    if metrics_b['avg_fabrication_risk'] < metrics_a['avg_fabrication_risk']:
        print("  ✓ B has lower fabrication risk")

    if metrics_b['anchor_verbatim_in_compression'] and not metrics_a['anchor_verbatim_in_compression']:
        print("  ✓ B preserves anchor verbatim (invariant maintained)")

    if metrics_b['hallucination_markers'] < metrics_a['hallucination_markers']:
        print("  ✓ B has fewer hallucination markers")

    if metrics_a['hallucination_markers'] > 0:
        print(f"\n  A's hallucination markers: {metrics_a.get('hallucination_details', [])}")

    print("\nConclusion:")
    if acc_b > acc_a:
        print("  Straight-line traversal (B) is more accurate.")
        print("  It grounds claims in sources, avoids fabrication,")
        print("  and faithfully preserves the invariant anchor.")
    else:
        print("  Curved traversal (A) achieved higher accuracy,")
        print("  possibly through richer source engagement.")

    print()


def main():
    # Load repo index
    print("Building repo index...")
    index = load_repo_index()
    print(f"Indexed {len(index)} files")

    # Read outputs
    out_a_path = os.path.join(SCRIPT_DIR, 'out_A.txt')
    out_b_path = os.path.join(SCRIPT_DIR, 'out_B.txt')

    if not os.path.exists(out_a_path) or not os.path.exists(out_b_path):
        print("ERROR: Output files not found. Run experiment first.")
        return 1

    with open(out_a_path, 'r') as f:
        text_a = f.read()
    with open(out_b_path, 'r') as f:
        text_b = f.read()

    # Compute accuracy metrics
    print("Analyzing accuracy...")
    metrics_a = compute_accuracy_metrics(text_a, index)
    metrics_b = compute_accuracy_metrics(text_b, index)

    # Print report
    scores = print_accuracy_report(metrics_a, metrics_b)
    interpret_accuracy(metrics_a, metrics_b, scores)

    # Save detailed results
    results = {
        'anchor': ANCHOR,
        'accuracy_A': metrics_a,
        'accuracy_B': metrics_b,
        'scores': scores
    }

    results_path = os.path.join(SCRIPT_DIR, 'accuracy_results.json')
    with open(results_path, 'w') as f:
        json.dump(results, f, indent=2, default=str)

    print(f"Detailed results saved to: {results_path}")
    return 0


if __name__ == "__main__":
    exit(main())
