import math
from statistics import mean, pstdev
from typing import Dict, Iterable, List, Tuple

State = Tuple[float, float]


def _rotate(state: State, omega: float) -> State:
    x, y = state
    c = math.cos(omega)
    s = math.sin(omega)
    return (c * x - s * y, s * x + c * y)


def _apply_boundary(state: State, boundary_radius: float) -> State:
    x, y = state
    r = math.hypot(x, y)
    if r == 0.0 or r <= boundary_radius:
        return state
    scale = boundary_radius / r
    return (x * scale, y * scale)


def iterate(state: State, params: Dict[str, float], steps: int) -> List[State]:
    omega = params["omega"]
    boundary_radius = params.get("boundary_radius", 1.0)

    trajectory = [state]
    current = state
    for _ in range(steps):
        current = _rotate(current, omega)
        current = _apply_boundary(current, boundary_radius)
        trajectory.append(current)
    return trajectory


def coarse_grain(state: State, params: Dict[str, float]) -> int:
    bins = int(params.get("bins", 8))
    x, y = state
    angle = math.atan2(y, x)
    if angle < 0:
        angle += 2 * math.pi
    idx = int(angle / (2 * math.pi) * bins)
    if idx == bins:
        idx = bins - 1
    return idx


def invariant_measure(trajectory: Iterable[State], params: Dict[str, float]) -> Dict[str, float]:
    bins = int(params.get("bins", 8))
    states = list(trajectory)
    radii = [math.hypot(x, y) for x, y in states]
    radius_mean = mean(radii)
    radius_std = pstdev(radii) if len(radii) > 1 else 0.0

    counts = [0] * bins
    for state in states:
        idx = coarse_grain(state, params)
        counts[idx] += 1

    total = len(states)
    probs = [count / total for count in counts]
    uniform = 1.0 / bins
    bin_l1_to_uniform = sum(abs(p - uniform) for p in probs)

    return {
        "radius_mean": radius_mean,
        "radius_std": radius_std,
        "bin_l1_to_uniform": bin_l1_to_uniform,
        "bins": bins,
    }


def predict(params: Dict[str, float]) -> Dict[str, float]:
    bins = int(params.get("bins", 8))
    expected: Dict[str, float] = {}

    initial_radius = params.get("initial_radius")
    if initial_radius is not None:
        expected["radius_mean"] = float(initial_radius)
        expected["radius_std_max"] = float(params.get("radius_std_max", 1e-10))

    if params.get("assume_ergodic", False):
        expected["bin_l1_to_uniform_max"] = float(params.get("uniform_tolerance", 0.15))

    period = params.get("period")
    if period is not None:
        q = int(period)
        expected["bin_l1_to_uniform_min"] = max(0.0, (bins - min(bins, q)) / bins)

    return expected
