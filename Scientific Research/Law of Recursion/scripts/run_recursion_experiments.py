import math
import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))

from recursion_law import invariant_measure, iterate


def _run_case(label, state, params, steps):
    trajectory = iterate(state, params, steps)
    inv = invariant_measure(trajectory, params)
    return {
        "label": label,
        "steps": steps,
        "bins": params.get("bins", 8),
        "radius_mean": inv["radius_mean"],
        "radius_std": inv["radius_std"],
        "bin_l1_to_uniform": inv["bin_l1_to_uniform"],
    }


def _print_table(title, rows, mapping_note):
    print(f"\n{title}")
    print(mapping_note)
    header = f"{'label':<18} {'steps':>7} {'bins':>5} {'radius_std':>12} {'bin_l1':>10}"
    print(header)
    print("-" * len(header))
    for row in rows:
        print(
            f"{row['label']:<18} {row['steps']:>7} {row['bins']:>5}"
            f" {row['radius_std']:>12.3e} {row['bin_l1_to_uniform']:>10.4f}"
        )


def main():
    bins = 16
    steps_list = [500, 1000, 2000, 5000, 10000, 20000]

    irrational_omega = 2 * math.pi * (math.sqrt(2) % 1.0)
    rational_omega = 2 * math.pi * (1 / 4)

    params_irrational = {"omega": irrational_omega, "boundary_radius": 1.0, "bins": bins}
    params_rational = {"omega": rational_omega, "boundary_radius": 1.0, "bins": bins}

    rows = []
    for steps in steps_list:
        rows.append(_run_case("irrational", (1.0, 0.0), params_irrational, steps))
        rows.append(_run_case("rational_1_4", (1.0, 0.0), params_rational, steps))

    _print_table(
        "Table A: L1 distance to uniform vs steps",
        rows,
        "Maps to Prediction 1 (uniformity) and Prediction 2 (radius conservation) in docs/LAW_OF_RECURSION.md.",
    )

    try:
        import matplotlib.pyplot as plt  # type: ignore

        irr_steps = []
        irr_l1 = []
        rat_steps = []
        rat_l1 = []
        for row in rows:
            if row["label"] == "irrational":
                irr_steps.append(row["steps"])
                irr_l1.append(row["bin_l1_to_uniform"])
            else:
                rat_steps.append(row["steps"])
                rat_l1.append(row["bin_l1_to_uniform"])

        plt.figure(figsize=(7, 4))
        plt.plot(irr_steps, irr_l1, marker="o", label="irrational")
        plt.plot(rat_steps, rat_l1, marker="o", label="rational 1/4")
        plt.xlabel("steps")
        plt.ylabel("L1 distance to uniform")
        plt.title("Prediction 1 vs Prediction 3: uniformity under recursion")
        plt.legend()
        plt.tight_layout()
        output_path = os.path.join(os.path.dirname(__file__), "recursion_experiments.png")
        plt.savefig(output_path)
        print(f"\nPlot saved to {output_path}")
        print("Plot maps to Prediction 1 (irrational uniformity) and Prediction 3 (rational non-uniformity).")
    except Exception as exc:
        print("\nPlotting skipped (matplotlib unavailable or error).")
        print(f"Reason: {exc}")


if __name__ == "__main__":
    main()
