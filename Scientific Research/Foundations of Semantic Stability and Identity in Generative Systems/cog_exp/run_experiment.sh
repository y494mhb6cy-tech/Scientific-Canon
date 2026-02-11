#!/bin/bash
# Experiment: Curved vs Straight-Line Traversal
# Compares energy proxies between two reasoning modes

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
cd "$REPO_DIR"

echo "========================================"
echo "COG Experiment: Curved vs Straight-Line"
echo "========================================"
echo "Repo: $REPO_DIR"
echo ""

# Check for Claude CLI
if ! command -v claude &> /dev/null; then
    echo "ERROR: Claude CLI not found"
    echo "Please install: npm install -g @anthropic-ai/claude-code"
    exit 1
fi

# Load prompts
PROMPT_A=$(python3 -c "import json; print(json.load(open('cog_exp/prompts.json'))['condition_A']['prompt'])")
PROMPT_B=$(python3 -c "import json; print(json.load(open('cog_exp/prompts.json'))['condition_B']['prompt'])")

echo "Running Condition A (Curved)..."
echo "--------------------------------"
START_A=$(date +%s.%N)
claude -p --dangerously-skip-permissions "$PROMPT_A" > cog_exp/out_A.txt 2>&1
END_A=$(date +%s.%N)
TIME_A=$(echo "$END_A - $START_A" | bc)
echo "Done. Time: ${TIME_A}s"
echo ""

echo "Running Condition B (Straight-Line)..."
echo "--------------------------------------"
START_B=$(date +%s.%N)
claude -p --dangerously-skip-permissions "$PROMPT_B" > cog_exp/out_B.txt 2>&1
END_B=$(date +%s.%N)
TIME_B=$(echo "$END_B - $START_B" | bc)
echo "Done. Time: ${TIME_B}s"
echo ""

# Save timing
echo "{\"time_A\": $TIME_A, \"time_B\": $TIME_B}" > cog_exp/timing.json

echo "Outputs saved to:"
echo "  - cog_exp/out_A.txt"
echo "  - cog_exp/out_B.txt"
echo ""

echo "Running evaluation..."
echo "====================="
python3 cog_exp/evaluate.py

echo ""
echo "Experiment complete."
