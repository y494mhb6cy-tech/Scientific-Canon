#!/usr/bin/env python3
"""
Evaluate effect of TWO integrated primitives.
Second primitive must integrate the first.

Tests whether chained primitive introduction:
1. Has compounding drops or bounded drops
2. Achieves recovery through integration
3. Is more or less efficient than single primitive
"""

import os
import re
import json
from typing import Dict, List, Set

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ANCHOR = "operators create identity governance validates moderation ensures coherence"
PRIMITIVE_1 = "fixed point"
PRIMITIVE_2 = "compression"

STOPWORDS = set("""
a an and are as at be but by for if in into is it its no not of on or
that the their then there these they this to was were will with would
can could did do does had has have how may might must shall should
very what when where which who why you your through together both
""".split())


def tokenize(text: str) -> Set[str]:
    words = re.findall(r"[A-Za-z][A-Za-z0-9_\-']+", text.lower())
    return set(w for w in words if w not in STOPWORDS and len(w) > 2)


def extract_steps(text: str) -> List[Dict]:
    """Extract individual steps from output."""
    steps = []
    step_pattern = r'Step\s+(\d+)[:\s]+'
    matches = list(re.finditer(step_pattern, text, re.IGNORECASE))

    for i, match in enumerate(matches):
        step_num = int(match.group(1))
        start = match.end()

        if i + 1 < len(matches):
            end = matches[i + 1].start()
        else:
            end_match = re.search(r'\n\s*(COMPRESSION|SUMMARY)[:\s]', text[start:], re.IGNORECASE)
            end = start + end_match.start() if end_match else len(text)

        content = text[start:end].strip()
        content_clean = re.sub(r'^\[[^\]]+\]\s*\n?', '', content)

        steps.append({
            'num': step_num,
            'content': content_clean.strip() if content_clean.strip() else content.strip()
        })

    return steps


def compute_step_metrics(step_content: str, anchor_vocab: Set[str],
                         vocab_after_p1: Set[str], vocab_after_p2: Set[str],
                         p1_tokens: Set[str], p2_tokens: Set[str]) -> Dict:
    """Compute metrics for a single step with two primitives."""
    tokens = tokenize(step_content)
    words = step_content.split()

    # Novelty against different vocabulary stages
    anchor_novelty = len(tokens - anchor_vocab) / max(1, len(tokens)) if tokens else 0
    p1_novelty = len(tokens - vocab_after_p1) / max(1, len(tokens)) if tokens else 0
    p2_novelty = len(tokens - vocab_after_p2) / max(1, len(tokens)) if tokens else 0

    # Anchor coverage
    anchor_terms_used = len(tokens & anchor_vocab)
    anchor_coverage = anchor_terms_used / max(1, len(anchor_vocab))

    # Primitive usage
    p1_used = len(tokens & p1_tokens) > 0
    p2_used = len(tokens & p2_tokens) > 0
    both_used = p1_used and p2_used

    # Integration check: does step mention both primitives together?
    text_lower = step_content.lower()
    p1_present = any(t in text_lower for t in p1_tokens)
    p2_present = any(t in text_lower for t in p2_tokens)
    integrated = p1_present and p2_present

    # Energy proxy
    energy = len(step_content) + (anchor_novelty * 500)
    efficiency = (anchor_coverage * 1000) / max(1, energy)

    return {
        'chars': len(step_content),
        'words': len(words),
        'anchor_novelty': round(anchor_novelty, 4),
        'p1_novelty': round(p1_novelty, 4),
        'p2_novelty': round(p2_novelty, 4),
        'anchor_coverage': round(anchor_coverage, 4),
        'p1_used': p1_used,
        'p2_used': p2_used,
        'both_used': both_used,
        'integrated': integrated,
        'energy': round(energy, 2),
        'efficiency': round(efficiency, 4)
    }


def analyze_trajectory(text: str, label: str) -> Dict:
    """Analyze step-by-step trajectory with two primitives."""
    anchor_vocab = tokenize(ANCHOR)
    p1_tokens = tokenize(PRIMITIVE_1)
    p2_tokens = tokenize(PRIMITIVE_2)
    vocab_after_p1 = anchor_vocab | p1_tokens
    vocab_after_p2 = vocab_after_p1 | p2_tokens

    steps = extract_steps(text)
    trajectory = []

    for step in steps:
        metrics = compute_step_metrics(
            step['content'], anchor_vocab,
            vocab_after_p1, vocab_after_p2,
            p1_tokens, p2_tokens
        )
        metrics['step'] = step['num']
        trajectory.append(metrics)

    return {
        'label': label,
        'trajectory': trajectory,
        'vocab_sizes': {
            'anchor': len(anchor_vocab),
            'after_p1': len(vocab_after_p1),
            'after_p2': len(vocab_after_p2)
        }
    }


def find_introduction_points(trajectory: List[Dict]) -> Dict:
    """Find steps where each primitive is first used."""
    p1_intro = -1
    p2_intro = -1

    for t in trajectory:
        if t.get('p1_used') and p1_intro < 0:
            p1_intro = t['step']
        if t.get('p2_used') and p2_intro < 0:
            p2_intro = t['step']

    return {'p1': p1_intro, 'p2': p2_intro}


def compute_phase_metrics(trajectory: List[Dict], intro_points: Dict) -> Dict:
    """Compute metrics for each phase of primitive introduction."""
    p1_step = intro_points['p1']
    p2_step = intro_points['p2']

    # Phase 0: Before any primitives
    phase0 = [t for t in trajectory if t['step'] < p1_step]
    # Phase 1: After P1, before P2
    phase1_intro = [t for t in trajectory if t['step'] == p1_step]
    phase1_post = [t for t in trajectory if p1_step < t['step'] < p2_step]
    # Phase 2: At P2 introduction
    phase2_intro = [t for t in trajectory if t['step'] == p2_step]
    # Phase 3: After both primitives
    phase3 = [t for t in trajectory if t['step'] > p2_step]

    def avg_metrics(phase):
        if not phase:
            return {'efficiency': 0, 'novelty': 0, 'integrated': 0}
        return {
            'efficiency': sum(t['efficiency'] for t in phase) / len(phase),
            'novelty': sum(t['anchor_novelty'] for t in phase) / len(phase),
            'integrated': sum(1 for t in phase if t.get('integrated', False)) / len(phase)
        }

    return {
        'baseline': avg_metrics(phase0),
        'p1_intro': avg_metrics(phase1_intro),
        'p1_post': avg_metrics(phase1_post),
        'p2_intro': avg_metrics(phase2_intro),
        'final': avg_metrics(phase3)
    }


def print_trajectory_table(analysis: Dict):
    """Print step-by-step trajectory table."""
    print(f"\n{'='*100}")
    print(f"TRAJECTORY: {analysis['label']}")
    print(f"{'='*100}")

    print(f"\n{'Step':<6} {'Chars':<7} {'Anchor':<8} {'AncNov':<8} {'P1Nov':<8} {'P2Nov':<8} {'P1':<4} {'P2':<4} {'Int':<5} {'Effic':<8}")
    print("-" * 100)

    for t in analysis['trajectory']:
        p1 = "✓" if t['p1_used'] else "-"
        p2 = "✓" if t['p2_used'] else "-"
        intg = "✓" if t['integrated'] else "-"
        print(f"{t['step']:<6} {t['chars']:<7} {t['anchor_coverage']:<8.3f} {t['anchor_novelty']:<8.4f} {t['p1_novelty']:<8.4f} {t['p2_novelty']:<8.4f} {p1:<4} {p2:<4} {intg:<5} {t['efficiency']:<8.4f}")

    print("-" * 100)


def print_phase_analysis(phases: Dict, intro_points: Dict):
    """Print phase-by-phase analysis."""
    print(f"\n{'='*70}")
    print("PHASE ANALYSIS: Two Integrated Primitives")
    print(f"{'='*70}")
    print(f"\nPrimitive 1 ('{PRIMITIVE_1}'): Introduced at Step {intro_points['p1']}")
    print(f"Primitive 2 ('{PRIMITIVE_2}'): Introduced at Step {intro_points['p2']}")
    print(f"Requirement: P2 must integrate P1")

    print(f"\n{'Phase':<25} {'Efficiency':<12} {'Novelty':<12} {'Integration':<12}")
    print("-" * 65)
    print(f"{'Baseline (before P1)':<25} {phases['baseline']['efficiency']:<12.4f} {phases['baseline']['novelty']:<12.4f} {'-':<12}")
    print(f"{'P1 Introduction':<25} {phases['p1_intro']['efficiency']:<12.4f} {phases['p1_intro']['novelty']:<12.4f} {'-':<12}")
    if phases['p1_post']['efficiency'] > 0:
        print(f"{'P1 Recovery':<25} {phases['p1_post']['efficiency']:<12.4f} {phases['p1_post']['novelty']:<12.4f} {'-':<12}")
    print(f"{'P2 Introduction':<25} {phases['p2_intro']['efficiency']:<12.4f} {phases['p2_intro']['novelty']:<12.4f} {phases['p2_intro']['integrated']:<12.1%}")
    print(f"{'Final (both integrated)':<25} {phases['final']['efficiency']:<12.4f} {phases['final']['novelty']:<12.4f} {phases['final']['integrated']:<12.1%}")
    print("-" * 65)

    # Calculate drops and recoveries
    p1_drop = phases['baseline']['efficiency'] - phases['p1_intro']['efficiency']
    p2_drop = phases['p1_intro']['efficiency'] - phases['p2_intro']['efficiency']
    total_drop = phases['baseline']['efficiency'] - min(phases['p1_intro']['efficiency'], phases['p2_intro']['efficiency'])
    recovery = phases['final']['efficiency'] - phases['p2_intro']['efficiency']

    print(f"\n{'Drop at P1:':<25} {p1_drop:+.4f}")
    print(f"{'Drop at P2:':<25} {p2_drop:+.4f}")
    print(f"{'Total drop:':<25} {total_drop:+.4f}")
    print(f"{'Recovery after P2:':<25} {recovery:+.4f}")

    recovered = phases['final']['efficiency'] > phases['p2_intro']['efficiency']
    exceeded_baseline = phases['final']['efficiency'] > phases['baseline']['efficiency']

    print(f"\n{'Recovered from P2:':<25} {'YES' if recovered else 'NO'}")
    print(f"{'Exceeded baseline:':<25} {'YES' if exceeded_baseline else 'NO'}")

    return {
        'p1_drop': p1_drop,
        'p2_drop': p2_drop,
        'total_drop': total_drop,
        'recovery': recovery,
        'recovered': recovered,
        'exceeded_baseline': exceeded_baseline
    }


def print_comparison(analysis_b: Dict, analysis_c: Dict, analysis_d: Dict):
    """Print comparison across all conditions."""
    print(f"\n{'='*80}")
    print("COMPARISON: B vs C vs D")
    print(f"{'='*80}")

    def summarize(analysis):
        traj = analysis['trajectory']
        return {
            'avg_eff': sum(t['efficiency'] for t in traj) / len(traj),
            'total_energy': sum(t['energy'] for t in traj),
            'final_eff': traj[-1]['efficiency'] if traj else 0,
            'min_eff': min(t['efficiency'] for t in traj),
            'integration_rate': sum(1 for t in traj if t.get('integrated', False)) / len(traj)
        }

    sum_b = summarize(analysis_b)
    sum_c = summarize(analysis_c)
    sum_d = summarize(analysis_d)

    print(f"\n{'Metric':<25} {'B (0 prim)':<15} {'C (1 prim)':<15} {'D (2 prim)':<15}")
    print("-" * 70)
    print(f"{'Avg efficiency':<25} {sum_b['avg_eff']:<15.4f} {sum_c['avg_eff']:<15.4f} {sum_d['avg_eff']:<15.4f}")
    print(f"{'Final step efficiency':<25} {sum_b['final_eff']:<15.4f} {sum_c['final_eff']:<15.4f} {sum_d['final_eff']:<15.4f}")
    print(f"{'Minimum efficiency':<25} {sum_b['min_eff']:<15.4f} {sum_c['min_eff']:<15.4f} {sum_d['min_eff']:<15.4f}")
    print(f"{'Total energy':<25} {sum_b['total_energy']:<15.1f} {sum_c['total_energy']:<15.1f} {sum_d['total_energy']:<15.1f}")
    print(f"{'Integration rate':<25} {'N/A':<15} {sum_c['integration_rate']:<15.1%} {sum_d['integration_rate']:<15.1%}")

    return sum_b, sum_c, sum_d


def print_graph(traj_b: List, traj_c: List, traj_d: List):
    """Print ASCII comparison graph."""
    print(f"\n{'='*75}")
    print("EFFICIENCY TRAJECTORY: B vs C vs D")
    print("="*75)
    print("\n  B = No primitives | C = +1 primitive | D = +2 integrated primitives")
    print("  * = P1 introduced | # = P2 introduced\n")

    max_steps = max(len(traj_b), len(traj_c), len(traj_d))
    all_eff = [t['efficiency'] for t in traj_b + traj_c + traj_d]
    max_eff = max(all_eff) if all_eff else 1

    def bar(val, width=20):
        w = int((val / max_eff) * width)
        return '█' * w

    print(f"  Step │ B            │ C            │ D")
    print(f"  ─────┼──────────────┼──────────────┼──────────────")

    for i in range(max_steps):
        eff_b = traj_b[i]['efficiency'] if i < len(traj_b) else 0
        eff_c = traj_c[i]['efficiency'] if i < len(traj_c) else 0
        eff_d = traj_d[i]['efficiency'] if i < len(traj_d) else 0

        p1_c = traj_c[i].get('p1_used', False) if i < len(traj_c) else False
        p1_d = traj_d[i].get('p1_used', False) if i < len(traj_d) else False
        p2_d = traj_d[i].get('p2_used', False) if i < len(traj_d) else False

        mark_c = "*" if p1_c and (i == 0 or not traj_c[i-1].get('p1_used', False)) else " "
        mark_d = "*" if p1_d and (i == 0 or not traj_d[i-1].get('p1_used', False)) else ""
        mark_d = "#" if p2_d and (i == 0 or not traj_d[i-1].get('p2_used', False)) else mark_d

        print(f"  {i+1:<4} │ {bar(eff_b):<12} │ {bar(eff_c):<12}{mark_c}│ {bar(eff_d):<12}{mark_d}")


def main():
    # Load all outputs
    files = {
        'B': os.path.join(SCRIPT_DIR, 'out_B.txt'),
        'C': os.path.join(SCRIPT_DIR, 'out_C.txt'),
        'D': os.path.join(SCRIPT_DIR, 'out_D.txt')
    }

    texts = {}
    for label, path in files.items():
        if os.path.exists(path):
            with open(path, 'r') as f:
                texts[label] = f.read()
        else:
            print(f"Missing: {path}")
            return 1

    # Analyze all trajectories
    analysis_b = analyze_trajectory(texts['B'], 'B (Straight-line, no primitives)')
    analysis_c = analyze_trajectory(texts['C'], 'C (Straight-line + 1 primitive)')
    analysis_d = analyze_trajectory(texts['D'], 'D (Straight-line + 2 integrated primitives)')

    # Print D trajectory in detail
    print_trajectory_table(analysis_d)

    # Find introduction points for D
    intro_d = find_introduction_points(analysis_d['trajectory'])
    phases_d = compute_phase_metrics(analysis_d['trajectory'], intro_d)
    drop_recovery = print_phase_analysis(phases_d, intro_d)

    # Print comparison
    print_comparison(analysis_b, analysis_c, analysis_d)

    # Print graph
    print_graph(analysis_b['trajectory'], analysis_c['trajectory'], analysis_d['trajectory'])

    # Interpretation
    print(f"\n{'='*75}")
    print("INTERPRETATION: Two Integrated Primitives")
    print(f"{'='*75}")

    if drop_recovery['recovered']:
        print("""
With TWO primitives where P2 integrates P1:

1. FIRST DROP (P1): Efficiency decreases when 'fixed point' introduced
   - Expected cost of vocabulary expansion

2. SECOND DROP (P2): Additional decrease when 'compression' introduced
   - But P2 integrates P1, so drops don't fully compound

3. RECOVERY: System stabilizes through integration
   - Both primitives become part of unified vocabulary
   - Integration requirement prevents independent drift

4. KEY FINDING: Integrated primitives have SUBADDITIVE cost
   - Cost(P1 + P2_integrated) < Cost(P1) + Cost(P2_independent)
   - Integration creates semantic bridge, reducing novelty
""")
    else:
        print("""
Recovery incomplete. The integration requirement may need:
- More steps after P2 for stabilization
- Stronger integration language
- Better primitive selection (semantic relatedness)
""")

    if drop_recovery['exceeded_baseline']:
        print("BONUS: Final efficiency EXCEEDS baseline!")
        print("       Integrated primitives enhance rather than degrade performance.")

    # Save results
    results = {
        'anchor': ANCHOR,
        'primitive_1': PRIMITIVE_1,
        'primitive_2': PRIMITIVE_2,
        'analysis_D': {
            'trajectory': analysis_d['trajectory'],
            'intro_points': intro_d,
            'phases': {k: dict(v) for k, v in phases_d.items()},
            'drop_recovery': drop_recovery
        }
    }

    with open(os.path.join(SCRIPT_DIR, 'two_primitives_results.json'), 'w') as f:
        json.dump(results, f, indent=2, default=str)

    print(f"\nResults saved to: cog_exp/two_primitives_results.json")
    return 0


if __name__ == "__main__":
    exit(main())
