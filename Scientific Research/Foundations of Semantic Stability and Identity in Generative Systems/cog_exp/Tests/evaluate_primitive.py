#!/usr/bin/env python3
"""
Evaluate effect of introducing ONE new primitive.
Tracks step-by-step metrics to show:
1. Initial efficiency drop when primitive introduced
2. Recovery as system stabilizes around expanded vocabulary
"""

import os
import re
import json
from typing import Dict, List, Set

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ANCHOR = "operators create identity governance validates moderation ensures coherence"
NEW_PRIMITIVE = "fixed point"

STOPWORDS = set("""
a an and are as at be but by for if in into is it its no not of on or
that the their then there these they this to was were will with would
can could did do does had has have how may might must shall should
very what when where which who why you your
""".split())

HEDGE_WORDS = ["maybe", "might", "could", "depends", "unclear", "perhaps", "arguably", "possibly"]
FRAME_MARKERS = ["however", "on the other hand", "alternatively", "another perspective", "conversely"]


def tokenize(text: str) -> Set[str]:
    words = re.findall(r"[A-Za-z][A-Za-z0-9_\-']+", text.lower())
    return set(w for w in words if w not in STOPWORDS and len(w) > 2)


def extract_steps(text: str) -> List[Dict]:
    """Extract individual steps from output."""
    steps = []

    # Find all step boundaries
    step_pattern = r'Step\s+(\d+)[:\s]+'
    matches = list(re.finditer(step_pattern, text, re.IGNORECASE))

    for i, match in enumerate(matches):
        step_num = int(match.group(1))
        start = match.end()

        # End is either next step, COMPRESSION, or end of text
        if i + 1 < len(matches):
            end = matches[i + 1].start()
        else:
            # Find COMPRESSION or SUMMARY
            end_match = re.search(r'\n\s*(COMPRESSION|SUMMARY)[:\s]', text[start:], re.IGNORECASE)
            if end_match:
                end = start + end_match.start()
            else:
                end = len(text)

        content = text[start:end].strip()

        # Remove citation bracket for cleaner content analysis
        # but keep the content after it
        content_clean = re.sub(r'^\[[^\]]+\]\s*\n?', '', content)

        steps.append({
            'num': step_num,
            'content': content_clean.strip() if content_clean.strip() else content.strip()
        })

    return steps


def compute_step_metrics(step_content: str, anchor_vocab: Set[str], expanded_vocab: Set[str]) -> Dict:
    """Compute metrics for a single step."""
    tokens = tokenize(step_content)
    words = step_content.split()

    # Novelty against original anchor
    anchor_novelty = len(tokens - anchor_vocab) / max(1, len(tokens)) if tokens else 0

    # Novelty against expanded vocab (anchor + primitive)
    expanded_novelty = len(tokens - expanded_vocab) / max(1, len(tokens)) if tokens else 0

    # Anchor alignment (how many anchor terms used)
    anchor_terms_used = len(tokens & anchor_vocab)
    anchor_coverage = anchor_terms_used / max(1, len(anchor_vocab))

    # Primitive usage
    primitive_tokens = tokenize(NEW_PRIMITIVE)
    primitive_used = len(tokens & primitive_tokens) > 0
    primitive_mentions = sum(1 for t in primitive_tokens if t in step_content.lower())

    # Ambiguity
    text_lower = step_content.lower()
    hedge_count = sum(text_lower.count(h) for h in HEDGE_WORDS)
    ambiguity = (hedge_count / max(1, len(words))) * 100

    # Frame switches
    frame_switches = sum(text_lower.count(m) for m in FRAME_MARKERS)

    # Energy proxy
    energy = len(step_content) + (anchor_novelty * 500) + (frame_switches * 100)

    # Efficiency = anchor coverage / energy (higher is better)
    efficiency = (anchor_coverage * 1000) / max(1, energy)

    return {
        'chars': len(step_content),
        'words': len(words),
        'anchor_novelty': round(anchor_novelty, 4),
        'expanded_novelty': round(expanded_novelty, 4),
        'anchor_coverage': round(anchor_coverage, 4),
        'anchor_terms_used': anchor_terms_used,
        'primitive_used': primitive_used,
        'primitive_mentions': primitive_mentions,
        'ambiguity': round(ambiguity, 4),
        'frame_switches': frame_switches,
        'energy': round(energy, 2),
        'efficiency': round(efficiency, 4)
    }


def analyze_trajectory(text: str, label: str) -> Dict:
    """Analyze step-by-step trajectory."""
    anchor_vocab = tokenize(ANCHOR)
    primitive_vocab = tokenize(NEW_PRIMITIVE)
    expanded_vocab = anchor_vocab | primitive_vocab

    steps = extract_steps(text)
    trajectory = []

    for step in steps:
        metrics = compute_step_metrics(step['content'], anchor_vocab, expanded_vocab)
        metrics['step'] = step['num']
        trajectory.append(metrics)

    return {
        'label': label,
        'total_steps': len(trajectory),
        'trajectory': trajectory,
        'anchor_vocab_size': len(anchor_vocab),
        'expanded_vocab_size': len(expanded_vocab)
    }


def find_primitive_introduction(trajectory: List[Dict]) -> int:
    """Find step where primitive is first used."""
    for t in trajectory:
        if t.get('primitive_used'):
            return t['step']
    return -1


def compute_recovery_metrics(trajectory: List[Dict], intro_step: int) -> Dict:
    """Compute metrics showing drop and recovery around primitive introduction."""
    if intro_step < 0 or len(trajectory) < 3:
        return {'drop': 0, 'recovery': 0, 'recovered': False}

    # Find pre-introduction baseline (steps before intro)
    pre_steps = [t for t in trajectory if t['step'] < intro_step]
    baseline_efficiency = sum(t['efficiency'] for t in pre_steps) / max(1, len(pre_steps)) if pre_steps else 0
    baseline_novelty = sum(t['anchor_novelty'] for t in pre_steps) / max(1, len(pre_steps)) if pre_steps else 0

    # Find introduction step metrics
    intro_metrics = next((t for t in trajectory if t['step'] == intro_step), None)
    intro_efficiency = intro_metrics['efficiency'] if intro_metrics else 0
    intro_novelty = intro_metrics['anchor_novelty'] if intro_metrics else 0

    # Find post-introduction metrics (steps after intro)
    post_steps = [t for t in trajectory if t['step'] > intro_step]
    post_efficiency = sum(t['efficiency'] for t in post_steps) / max(1, len(post_steps)) if post_steps else 0
    post_novelty = sum(t['anchor_novelty'] for t in post_steps) / max(1, len(post_steps)) if post_steps else 0

    # Calculate drop and recovery
    efficiency_drop = baseline_efficiency - intro_efficiency
    efficiency_recovery = post_efficiency - intro_efficiency

    novelty_spike = intro_novelty - baseline_novelty
    novelty_recovery = intro_novelty - post_novelty

    # Did it recover? Post should be closer to baseline than intro was
    recovered = post_efficiency > intro_efficiency and post_novelty < intro_novelty

    return {
        'baseline_efficiency': round(baseline_efficiency, 4),
        'intro_efficiency': round(intro_efficiency, 4),
        'post_efficiency': round(post_efficiency, 4),
        'efficiency_drop': round(efficiency_drop, 4),
        'efficiency_recovery': round(efficiency_recovery, 4),
        'baseline_novelty': round(baseline_novelty, 4),
        'intro_novelty': round(intro_novelty, 4),
        'post_novelty': round(post_novelty, 4),
        'novelty_spike': round(novelty_spike, 4),
        'novelty_recovery': round(novelty_recovery, 4),
        'recovered': recovered
    }


def print_trajectory_table(analysis: Dict):
    """Print step-by-step trajectory table."""
    print(f"\n{'='*85}")
    print(f"TRAJECTORY: {analysis['label']}")
    print(f"{'='*85}")

    print(f"\n{'Step':<6} {'Chars':<7} {'Anchor':<8} {'Novelty':<9} {'ExpNov':<9} {'Prim':<6} {'Energy':<10} {'Effic':<8}")
    print("-" * 85)

    for t in analysis['trajectory']:
        prim = "YES" if t['primitive_used'] else "-"
        print(f"{t['step']:<6} {t['chars']:<7} {t['anchor_coverage']:<8.3f} {t['anchor_novelty']:<9.4f} {t['expanded_novelty']:<9.4f} {prim:<6} {t['energy']:<10.1f} {t['efficiency']:<8.4f}")

    print("-" * 85)


def print_comparison_graph(traj_b: List[Dict], traj_c: List[Dict]):
    """Print ASCII graph comparing B and C efficiency."""
    print(f"\n{'='*70}")
    print("EFFICIENCY TRAJECTORY (B vs C)")
    print("="*70)
    print("\n  B = Straight-line (no new primitives)")
    print("  C = Straight-line + ONE primitive ('fixed point')")
    print("  * = Primitive introduced\n")

    max_steps = max(len(traj_b), len(traj_c))

    # Normalize to 0-40 scale for ASCII
    all_eff = [t['efficiency'] for t in traj_b] + [t['efficiency'] for t in traj_c]
    max_eff = max(all_eff) if all_eff else 1

    def bar(val, marker='█'):
        width = int((val / max_eff) * 40)
        return marker * width

    print(f"  Step │ B Efficiency          │ C Efficiency")
    print(f"  ─────┼───────────────────────┼─────────────────────────────────")

    for i in range(max_steps):
        eff_b = traj_b[i]['efficiency'] if i < len(traj_b) else 0
        eff_c = traj_c[i]['efficiency'] if i < len(traj_c) else 0
        prim_c = traj_c[i].get('primitive_used', False) if i < len(traj_c) else False

        bar_b = bar(eff_b)
        bar_c = bar(eff_c, '▓' if prim_c else '█')
        marker = " *" if prim_c else "  "

        print(f"  {i+1:<4} │ {bar_b:<21} │ {bar_c}{marker}")

    print()


def main():
    # Load outputs
    files = {
        'B': os.path.join(SCRIPT_DIR, 'out_B.txt'),
        'C': os.path.join(SCRIPT_DIR, 'out_C.txt')
    }

    texts = {}
    for label, path in files.items():
        if os.path.exists(path):
            with open(path, 'r') as f:
                texts[label] = f.read()
        else:
            print(f"Missing: {path}")
            return 1

    # Analyze trajectories
    analysis_b = analyze_trajectory(texts['B'], 'B (Straight-line, no new primitives)')
    analysis_c = analyze_trajectory(texts['C'], 'C (Straight-line + ONE primitive)')

    # Print trajectory tables
    print_trajectory_table(analysis_b)
    print_trajectory_table(analysis_c)

    # Find primitive introduction in C
    intro_step = find_primitive_introduction(analysis_c['trajectory'])
    print(f"\n{'='*70}")
    print(f"PRIMITIVE INTRODUCTION ANALYSIS")
    print(f"{'='*70}")
    print(f"\nNew primitive: '{NEW_PRIMITIVE}'")
    print(f"Introduced at: Step {intro_step}")

    # Compute recovery metrics
    recovery = compute_recovery_metrics(analysis_c['trajectory'], intro_step)

    print(f"\n{'Phase':<20} {'Efficiency':<12} {'Novelty':<12}")
    print("-" * 50)
    print(f"{'Pre-introduction':<20} {recovery['baseline_efficiency']:<12.4f} {recovery['baseline_novelty']:<12.4f}")
    print(f"{'At introduction':<20} {recovery['intro_efficiency']:<12.4f} {recovery['intro_novelty']:<12.4f}")
    print(f"{'Post-introduction':<20} {recovery['post_efficiency']:<12.4f} {recovery['post_novelty']:<12.4f}")
    print("-" * 50)
    print(f"{'Efficiency drop':<20} {recovery['efficiency_drop']:<12.4f}")
    print(f"{'Efficiency recovery':<20} {recovery['efficiency_recovery']:<12.4f}")
    print(f"{'Novelty spike':<20} {recovery['novelty_spike']:<12.4f}")
    print(f"{'Novelty recovery':<20} {recovery['novelty_recovery']:<12.4f}")
    print(f"\nRecovered: {'YES' if recovery['recovered'] else 'NO'}")

    # Print comparison graph
    print_comparison_graph(analysis_b['trajectory'], analysis_c['trajectory'])

    # Summary comparison
    print(f"{'='*70}")
    print("SUMMARY: B vs C")
    print(f"{'='*70}")

    avg_b = sum(t['efficiency'] for t in analysis_b['trajectory']) / max(1, len(analysis_b['trajectory']))
    avg_c = sum(t['efficiency'] for t in analysis_c['trajectory']) / max(1, len(analysis_c['trajectory']))

    total_energy_b = sum(t['energy'] for t in analysis_b['trajectory'])
    total_energy_c = sum(t['energy'] for t in analysis_c['trajectory'])

    print(f"\n{'Metric':<30} {'B (no prim)':<15} {'C (+1 prim)':<15}")
    print("-" * 60)
    print(f"{'Avg efficiency':<30} {avg_b:<15.4f} {avg_c:<15.4f}")
    print(f"{'Total energy':<30} {total_energy_b:<15.1f} {total_energy_c:<15.1f}")
    print(f"{'Primitive introduced':<30} {'No':<15} {f'Step {intro_step}':<15}")
    print(f"{'Recovered after intro':<30} {'N/A':<15} {'Yes' if recovery['recovered'] else 'No':<15}")

    # Interpretation
    print(f"\n{'='*70}")
    print("INTERPRETATION")
    print(f"{'='*70}")

    if recovery['recovered']:
        print("""
When ONE primitive is introduced in controlled fashion:

1. INITIAL DROP: Efficiency decreases at introduction point
   - Novelty spikes (new term outside anchor vocab)
   - Energy cost increases

2. RECOVERY: System stabilizes in subsequent steps
   - Primitive becomes part of expanded vocabulary
   - Novelty against expanded vocab decreases
   - Efficiency recovers toward baseline

3. COST/BENEFIT:
   - Controlled primitive introduction has bounded cost
   - Recovery is possible because the primitive is INTEGRATED
   - Unlike curved traversal where novelty compounds without recovery

4. KEY INSIGHT:
   Straight-line + controlled primitives = SUSTAINABLE expansion
   Curved = UNBOUNDED drift (no recovery mechanism)
""")
    else:
        print("""
Recovery not achieved in this run. Possible causes:
- Primitive not well-integrated into subsequent steps
- Too few steps after introduction
- Primitive creates semantic branch rather than extension
""")

    # Save results
    results = {
        'anchor': ANCHOR,
        'new_primitive': NEW_PRIMITIVE,
        'analysis_B': {
            'trajectory': analysis_b['trajectory'],
            'avg_efficiency': avg_b,
            'total_energy': total_energy_b
        },
        'analysis_C': {
            'trajectory': analysis_c['trajectory'],
            'avg_efficiency': avg_c,
            'total_energy': total_energy_c,
            'primitive_intro_step': intro_step,
            'recovery': recovery
        }
    }

    with open(os.path.join(SCRIPT_DIR, 'primitive_results.json'), 'w') as f:
        json.dump(results, f, indent=2)

    print(f"\nResults saved to: cog_exp/primitive_results.json")
    return 0


if __name__ == "__main__":
    exit(main())
