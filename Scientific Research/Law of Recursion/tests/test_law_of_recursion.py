import math
import os
import random
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))

from recursion_law import invariant_measure, iterate


def test_radius_conserved_within_boundary():
    params = {"omega": 0.37, "boundary_radius": 1.0, "bins": 12}
    state = (0.6, 0.0)
    trajectory = iterate(state, params, 2000)
    inv = invariant_measure(trajectory, params)
    assert abs(inv["radius_mean"] - 0.6) < 1e-9
    assert inv["radius_std"] < 1e-9


def test_uniformity_irrational_rotation():
    omega = 2 * math.pi * (math.sqrt(2) % 1.0)
    params = {"omega": omega, "boundary_radius": 1.0, "bins": 16}
    trajectory = iterate((1.0, 0.0), params, 20000)
    inv = invariant_measure(trajectory, params)
    assert inv["bin_l1_to_uniform"] <= 0.15


def test_non_uniform_rational_rotation():
    omega = 2 * math.pi * (1 / 4)
    bins = 12
    params = {"omega": omega, "boundary_radius": 1.0, "bins": bins}
    trajectory = iterate((1.0, 0.0), params, 120)
    inv = invariant_measure(trajectory, params)
    expected_min = (bins - 4) / bins
    assert inv["bin_l1_to_uniform"] >= expected_min - 1e-9


def test_boundary_activation_breaks_conservation():
    params = {"omega": 0.7, "boundary_radius": 1.0, "bins": 8}
    trajectory = iterate((2.0, 0.0), params, 10)
    inv = invariant_measure(trajectory, params)
    assert inv["radius_mean"] < 1.5
    assert inv["radius_std"] > 0.2


def test_randomized_radius_invariance():
    random.seed(0)
    for _ in range(10):
        r = random.uniform(0.1, 0.9)
        theta = random.uniform(0.0, 2 * math.pi)
        state = (r * math.cos(theta), r * math.sin(theta))
        omega = random.uniform(0.1, 2.0)
        params = {"omega": omega, "boundary_radius": 1.0, "bins": 10}
        trajectory = iterate(state, params, 500)
        inv = invariant_measure(trajectory, params)
        assert abs(inv["radius_mean"] - r) < 1e-9
        assert inv["radius_std"] < 1e-9
