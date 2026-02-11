"""
InvariantAI - Reasoning Policy Enforcement Tool

A portable tool for enforcing invariant-preserving reasoning policies.
Enables straight-line (convergent) and curved (exploratory) reasoning modes
with configurable policy constraints, scoring, and validation.
"""

__version__ = "1.0.0"
__author__ = "Moneta Analytica"

from .reasoning import (
    analyze_text,
    validate_output,
    generate_prompt,
    build_index,
    traverse,
    load_policy,
    DEFAULT_CONFIG,
)

__all__ = [
    "analyze_text",
    "validate_output",
    "generate_prompt",
    "build_index",
    "traverse",
    "load_policy",
    "DEFAULT_CONFIG",
]
