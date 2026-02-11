# Agent Organization Reference

A complete reference for the operator-based agent architecture that transforms Fields (problems) into Identities (solutions) through structured governance, execution, and moderation.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Organizational Hierarchy](#2-organizational-hierarchy)
3. [Governance Layer](#3-governance-layer)
4. [Execution Layer — Operator Stack](#4-execution-layer--operator-stack)
5. [Moderation Layer — Meta-Operators](#5-moderation-layer--meta-operators)
6. [Branch-Limb-Anchor Architecture](#6-branch-limb-anchor-architecture)
7. [Agent Loop & Checkpoint Protocol](#7-agent-loop--checkpoint-protocol)
8. [Validation Rules](#8-validation-rules)
9. [Execution Templates](#9-execution-templates)
10. [Script Interface](#10-script-interface)

---

## 1. System Overview

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         MISSION                                  │
│              Why the system exists. Success criteria.            │
└───────────────────────────┬─────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                       GOVERNANCE                                 │
│        Selects Fields. Allocates resources. Defines success.     │
└───────────────────────────┬─────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                       EXECUTION                                  │
│   Field → Distinction → Direction → Constraint → Action →       │
│                    Pattern → Identity                            │
└───────────────────────────┬─────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                       MODERATION                                 │
│     Recursion (stability) · Interpretation (weight) ·           │
│                   Observation (trajectory)                       │
└───────────────────────────┬─────────────────────────────────────┘
                            ↓
                      DELIVERABLE
                            ↓
              ┌─────────────────────────┐
              │   GOVERNANCE REVIEW     │
              │   Portfolio synthesis   │
              └─────────────────────────┘
```

### Core Principles

> **Operators create identity.**
> **Governance decides if it was worth creating.**
> **Moderation ensures it remains coherent.**

### Canonical Compression

```
Field → Operator → Pattern → Persistence
```

**Axioms:**
1. No layer introduces new power
2. Each layer specializes an implicit operator
3. Identity is a stabilized operator loop
4. Terminal is where symbol collapses into force

---

## 2. Organizational Hierarchy

### Tier Mapping

| Military   | Business     | Framework      | Function                                |
|------------|--------------|----------------|-----------------------------------------|
| Branch     | Organization | **MISSION**    | Why the system exists; success criteria |
| Division   | Department   | **GOVERNANCE** | Problem selection, priority, resources  |
| Squad      | Team         | **OPERATORS**  | Execute Field → Identity                |
| Oversight  | QA           | **MODERATORS** | Trajectory, stability, weights          |

### Phase Model

| Phase           | Owner          | Function                          |
|-----------------|----------------|-----------------------------------|
| **MISSION**     | Organization   | Define purpose and success        |
| **GOVERNANCE**  | Division       | Select, prioritize, resource      |
| **DISCOVERY**   | Human Operator | Reduce Field, list Constraints    |
| **EXECUTION**   | Agent Team     | Operators 1-7 → Identity          |
| **MODERATION**  | Meta-Agents    | Checkpoints, trajectory control   |
| **DELIVERABLE** | System         | Identity output                   |
| **REVIEW**      | Governance     | Success criteria met?             |
| **PORTFOLIO**   | Organization   | Compound Identities into progress |

---

## 3. Governance Layer

Governance **does not solve problems**. It selects **which Fields deserve collapse** and defines what "success" means.

### Responsibilities

| Function            | Question                             |
|---------------------|--------------------------------------|
| Mission Alignment   | Does this problem serve our purpose? |
| Prioritization      | Which problems matter most now?      |
| Resource Allocation | What capacity can we commit?         |
| Success Criteria    | How will we know it worked?          |
| Portfolio Synthesis | How do solutions compound?           |

### Governance ↔ Execution Mapping

| Governance          | Maps To        | Effect                    |
|---------------------|----------------|---------------------------|
| Mission Alignment   | Field (1)      | Validates possibility space|
| Prioritization      | Distinction (2)| Sets scope and order      |
| Resource Allocation | Constraint (4) | Bounds capacity           |
| Success Criteria    | Identity (7)   | Defines persistence test  |
| Portfolio Synthesis | Pattern (6)    | Evaluates compounding     |

> **Governance is the operator that selects operators.**

### Governance Output Format

```
MISSION CONTEXT: [purpose]
SELECTED FIELD: [problem]
PRIORITY: [rank]
RESOURCES: [time, attention, authority]
SUCCESS CRITERIA: [measurable conditions]
PORTFOLIO POSITION: [strategic fit]
```

---

## 4. Execution Layer — Operator Stack

Seven operators collapse Fields into Identities. Executed sequentially.

```
FIELD → DISTINCTION → DIRECTION → CONSTRAINT → ACTION → PATTERN → IDENTITY
```

### Operator Summary

| #  | Operator        | Class         | Function                  |
|----|-----------------|---------------|---------------------------|
| 1  | **Field**       | Context       | Establishes state space   |
| 2  | **Distinction** | Filter        | Defines boundaries        |
| 3  | **Direction**   | Flow          | Routes energy/data        |
| 4  | **Constraint**  | Control       | Imposes limits            |
| 5  | **Action**      | Execution     | Irreversible state change |
| 6  | **Pattern**     | Temporal      | Stabilizes via repetition |
| 7  | **Identity**    | Stabilization | Maintains persistence     |

### Execution Law

> No new power is introduced after Field.
> Each layer specializes constraint.

---

### Operator 1: FIELD (Context Operator)

**Function:** Establish the total possibility space of the problem.

**Logical Rules:**
1. Capture ALL elements mentioned or implied in the problem
2. Make no judgments about relevance yet
3. Identify the system boundary (what's inside the problem, what's environment)
4. Name the core tension (the thing that makes this a problem)

**Output Format:**
```
ENTITIES: [list all people, systems, processes, resources]
CONDITIONS: [list all stated or implied conditions]
BOUNDARY: Inside = [...] | Outside = [...]
CORE TENSION: "The problem exists because ___"
```

**Completion Criteria:** The problem space is fully mapped with no element excluded.

---

### Operator 2: DISTINCTION (Argument/Modifier)

**Function:** Create boundaries and contrasts within the Field.

**Logical Rules:**
1. Every element must be categorized
2. Categories must be mutually exclusive
3. Identify what OPPOSES what (tensions, trade-offs)
4. Mark what is VARIABLE vs. FIXED

**Output Format:**
```
CATEGORIES: {Group A: [...], Group B: [...], ...}
VARIABLES: [list with change potential]
FIXED: [list of constraints]
OPPOSITIONS: [A vs B, C vs D, ...]
CRITICAL EDGE: [statement of where/when problem manifests]
```

**Completion Criteria:** All elements are sorted; tensions are explicit; the critical boundary is named.

---

### Operator 3: DIRECTION (Flow Operator)

**Function:** Map causal vectors—what drives what, where energy flows.

**Logical Rules:**
1. Every variable must have at least one causal arrow (in or out)
2. Identify feedback loops (reinforcing or balancing)
3. Find the PRIMARY DRIVER (the variable with most downstream effects)
4. Find the BOTTLENECK (where flow constricts)

**Output Format:**
```
CAUSAL MAP:
  - [Variable A] → [Variable B] → [Outcome]
  - [Variable C] ↔ [Variable D] (feedback: +/-)
PRIMARY DRIVER: [variable] because [reason]
BOTTLENECK: [variable/process] because [reason]
LEVERAGE POINT: [statement on where intervention would have most impact]
```

**Completion Criteria:** Causal structure is explicit; leverage point is identified.

---

### Operator 4: CONSTRAINT (Control Operator)

**Function:** Apply rules, limits, permissions—what is and isn't allowed.

**Logical Rules:**
1. Every proposed change must pass feasibility check
2. Identify HARD CONSTRAINTS (non-negotiable) vs. SOFT CONSTRAINTS (preferences)
3. Check for LOGICAL CONFLICTS (can't do A and B simultaneously)
4. Define the PERMISSION BOUNDARY (who/what can authorize change)

**Output Format:**
```
HARD CONSTRAINTS: [list with reasons]
SOFT CONSTRAINTS: [list with flex conditions]
PERMITTED INTERVENTIONS at bottleneck: [list]
FORBIDDEN INTERVENTIONS: [list with reasons]
CONFLICTS: [pairs that cannot coexist]
PERMISSION BOUNDARY: [who/what must authorize]
```

**Completion Criteria:** The solution space is bounded; impossible paths are eliminated.

---

### Operator 5: ACTION (Action Operator)

**Function:** Specify concrete, irreversible changes that move the system.

**Logical Rules:**
1. Every action must target the PRIMARY DRIVER or BOTTLENECK
2. Actions must be SPECIFIC (who does what by when)
3. Actions must pass all HARD CONSTRAINTS
4. Actions must be IRREVERSIBLE in effect (create real state change)

**Output Format:**
```
ACTIONS (passing constraints only):
  1. WHO: [actor]
     WHAT: [specific action]
     WHEN: [timing]
     STATE CHANGE: [what becomes irreversibly different]

LEVERAGE RANKING: [ordered list with rationale]
```

**Completion Criteria:** At least one concrete, constraint-compliant action is specified.

---

### Operator 6: PATTERN (Temporal Operator)

**Function:** Structure actions into repeatable, coherent process.

**Logical Rules:**
1. Actions must be SEQUENCED (what order)
2. TRIGGERS must be defined (what initiates each action)
3. FEEDBACK MECHANISM must exist (how to know if it's working)
4. CYCLE TIME must be specified (how often the pattern repeats)

**Output Format:**
```
SEQUENCE:
  1. [Action] ← Trigger: [condition] → Feedback: [signal]
  2. ...

CYCLE TIME: [frequency]
STABILIZATION POINT: [condition when pattern becomes self-sustaining]

PROCESS FLOW:
[Trigger] → [Action 1] → [Check] → [Action 2] → ... → [Outcome]
```

**Completion Criteria:** A repeatable process exists with clear triggers and feedback.

---

### Operator 7: IDENTITY (Stabilization Operator)

**Function:** Crystallize the solution into persistent structure that resolves the original Field.

**Logical Rules:**
1. The Identity must RESOLVE the Core Tension named in Field
2. The Identity must be SELF-MAINTAINING (doesn't require constant intervention)
3. The Identity must be NAMED (it becomes a thing, not just a process)
4. VERIFY: trace back through all agents to confirm logical soundness

**Output Format:**
```
IDENTITY NAME: [noun — a system, structure, or entity]
PERSISTENCE MECHANISM: [how it self-maintains]

RESOLUTION CHECK: [YES/NO]
PROOF: [explicit statement linking identity to core tension resolution]

TRACE VERIFICATION:
  - Pattern: ✓/✗ [note]
  - Action: ✓/✗ [note]
  - Constraint: ✓/✗ [note]
  - Direction: ✓/✗ [note]
  - Distinction: ✓/✗ [note]
  - Field: ✓/✗ [note]

TRANSFORMATION: "The Field was [problem]. The Identity is [solution]."
```

**Completion Criteria:** A named, self-maintaining structure exists that provably resolves the original problem.

---

## 5. Moderation Layer — Meta-Operators

Moderators **do not execute**. They operate on operators to prevent drift.

### Moderator Summary

| #  | Moderator          | Class               | Function                |
|----|--------------------|---------------------|-------------------------|
| 8  | **Recursion**      | Reference Stability | Locks stable references |
| 9  | **Interpretation** | Weighting           | Adjusts importance      |
| 10 | **Observation**    | Measurement         | Monitors trajectory     |

### Moderation Bus

Feeds back into execution **without touching Action (5)**.

```
                MODERATION BUS
                      │
      ┌───────────────┼───────────────┐
      ↓               ↓               ↓
  FIELD (1)     CONSTRAINT (4)   IDENTITY (7)
  reframe       tighten/loosen   reinforce/decay
```

> Moderation controls **trajectory**, not execution.

---

### Moderator 8: RECURSION (Reference Stability)

**Function:** Gather stable reference points across the system.

**Monitors:** Pattern (6), Identity (7), Field (1)

**Execute:**
1. After each operator completes, identify STABLE REFERENCES (outputs unlikely to change)
2. Track which references PERSIST across multiple operators
3. Flag UNSTABLE elements that keep shifting
4. At Identity: confirm all critical references are anchored

**Intervention Triggers:**
- Reference point contradicts earlier stable reference → flag for review
- No stable references emerging by Operator 4 → alert: problem may be underdefined
- Identity contains elements not traceable to stable references → verification fails

**Output Format:**
```
STABLE REFERENCES:
  - [Reference 1]: Stabilized at [Operator], persists through [Operators]
  - [Reference 2]: ...
UNSTABLE FLAGS: [elements still in flux]
ANCHOR VERIFICATION: [all critical refs traced to Field: YES/NO]
```

---

### Moderator 9: INTERPRETATION (Weighting)

**Function:** Assign weight to reference points given the field context.

**Monitors:** Distinction (2), Constraint (4), Direction (3)

**Execute:**
1. Receive stable references from Recursion
2. Weight each reference by RELEVANCE to Core Tension (1-10)
3. Weight each reference by LEVERAGE on Bottleneck (1-10)
4. Compute PRIORITY SCORE: (Relevance × Leverage) / 2
5. Flag references with high weight but low action coverage

**Output Format:**
```
WEIGHTED REFERENCES:
  - [Reference]: Relevance=[X], Leverage=[Y], Priority=[Z]
  - ...
PRIORITY RANKING: [ordered by score]
HIGH-WEIGHT GAPS: [references with Priority >7 but weak Action coverage]
INTERPRETATION SUMMARY: [which references dominate the solution]
```

---

### Moderator 10: OBSERVATION (Trajectory)

**Function:** Manage the curve of the overall system.

**Monitors:** All operators, especially Field (1) and Direction (3)

**Execute:**
1. Track TRAJECTORY: Is the system moving toward Identity or drifting?
2. Measure CURVATURE: Rate of change in possibility space at each operator
3. Detect INFLECTION POINTS: Where does the solution path bend sharply?
4. Flag DIVERGENCE: When execution deviates from optimal path to goal Identity

**Curvature Metrics:**
- **High curvature:** Rapid reduction in possibility space (good: converging)
- **Low curvature:** Slow reduction (warning: may not reach Identity)
- **Negative curvature:** Possibility space expanding (error: regression)

**Output Format:**
```
TRAJECTORY: [Converging / Drifting / Diverging]
CURVATURE BY OPERATOR:
  - Field → Distinction: [value] [assessment]
  - Distinction → Direction: [value] [assessment]
  - ...
INFLECTION POINTS: [Operator X: sharp turn because...]
DIVERGENCE ALERTS: [any regression or expansion flags]
SYSTEM HEALTH: [overall assessment]
```

### Moderator ↔ Operator Mapping

| Moderator              | Primary Operator Mapping       | Secondary Mapping |
|------------------------|--------------------------------|-------------------|
| **Recursion (8)**      | Pattern (6), Identity (7)      | Field (1)         |
| **Interpretation (9)** | Distinction (2), Constraint (4)| Direction (3)     |
| **Observation (10)**   | Field (1), Direction (3)       | All operators     |

### Intervention Hierarchy

1. **OBSERVATION** detects drift/divergence → halts execution, flags operator
2. **RECURSION** finds unstable reference → returns to last stable state
3. **INTERPRETATION** finds high-weight gap → requests additional Action coverage

---

## 6. Branch-Limb-Anchor Architecture

### Constitutional Structure

**Branches** — Primary operator agents (1-7)
- Declare: Anchors read, Anchors written, Limb spawn conditions
- Flow: Probe → Chunk → Limb Calls → Aggregate → Output → Checkpoint

**Limbs** — Scoped ephemeral sub-calls
- Max recursion depth: 1 (Limbs cannot spawn Limbs)
- Stateless; all context passed explicitly
- Parallelizable within Branch
- Patterns: Classify | Extract | Transform | Verify | Aggregate

**Anchors** — Stable reference buffers persisting across Branches

### Anchor Status States

| Status      | Definition                               |
|-------------|------------------------------------------|
| UNSTABLE    | Currently being written                  |
| CANDIDATE   | Branch complete, awaiting moderation     |
| STABLE      | Locked by Recursion, read-only           |
| DECAYED     | Flagged by Observation for review        |

**Rules:**
- Only STABLE Anchors read without warning
- DECAYED Anchors halt execution until resolved

### Flow Summary

1. Governance selects Field
2. Branches collapse Field through Limbs into Anchors
3. Moderators stabilize Anchors
4. Identity emerges from stable Anchors
5. Governance validates Identity against Mission

---

## 7. Agent Loop & Checkpoint Protocol

### Core Loop Structure

```
MISSION → GOVERNANCE → EXECUTION → MODERATION → DELIVERABLE → REVIEW
    ↑                                                              │
    └──────────────────────────────────────────────────────────────┘
```

### Checkpoint Triggers

1. After each operator completes
2. Every N characters of output (configurable, default 2000)
3. When Anchor conflict detected

### Checkpoint Format

```
---CHECKPOINT---
Operator: [name]
Status: Complete
Key Output: [2-3 sentence summary]

MODERATOR REVIEW:
• RECURSION: [stable refs identified]
• INTERPRETATION: [priority weights]
• OBSERVATION: [trajectory assessment]

RECOMMENDATION: CONTINUE / ADJUST / HALT
[If ADJUST: what must change]
---END CHECKPOINT---
```

### Full System Flow

```
MISSION
  │
  ↓
GOVERNANCE ──────────────────────────────────┐
  │ Select Field                             │
  │ Set Constraints                          │
  │ Define Success                           │
  ↓                                          │
DISCOVERY (Human Operator)                   │
  │ Reduce Field to objective terms          │
  │ List hard constraints                    │
  ↓                                          │
EXECUTION                                    │
  │                                          │
  ├─→ FIELD ──────────→ checkpoint           │
  │                                          │
  ├─→ DISTINCTION ────→ checkpoint           │
  │                                          │
  ├─→ DIRECTION ──────→ checkpoint           │
  │                                          │
  ├─→ CONSTRAINT ─────→ checkpoint           │
  │                                          │
  ├─→ ACTION ─────────→ checkpoint           │
  │                                          │
  ├─→ PATTERN ────────→ checkpoint           │
  │                                          │
  └─→ IDENTITY ───────→ final moderation     │
                          │                  │
                          ↓                  │
                    DELIVERABLE              │
                          │                  │
                          ↓                  │
                    GOVERNANCE REVIEW ◄──────┘
                          │
                          ↓
                    PORTFOLIO UPDATE
```

---

## 8. Validation Rules

### Governance Validation
- [ ] Field aligns with Mission
- [ ] Resources allocated within capacity
- [ ] Success criteria are measurable

### Execution Validation
- [ ] All operators produce required outputs
- [ ] No action violates hard constraints
- [ ] Identity resolves Core Tension

### Moderation Validation
- [ ] All critical references anchored (Recursion)
- [ ] High-weight elements covered by Action (Interpretation)
- [ ] Trajectory converging at Identity (Observation)

### Deliverable Validation
- [ ] Identity named (noun)
- [ ] Transformation statement complete
- [ ] Success criteria testable against output

### Branch/Anchor Validation
- [ ] All Anchors written, no conflicts
- [ ] All Limbs logged
- [ ] All critical STABLE before Identity
- [ ] None DECAYED at completion
- [ ] Lineage traceable

### Failure Protocol

If any verification fails:
1. Identify the failing operator
2. Re-execute that operator with stricter adherence to rules
3. Propagate changes forward through subsequent operators
4. Re-verify at Identity

---

## 9. Execution Templates

### Discovery Input Template

```
FIELD: [problem in objective terms]
CONSTRAINTS: [hard limits]
TARGET IDENTITY: [goal state]
```

### Deliverable Output Template

```
IDENTITY NAME: [noun]
PERSISTENCE MECHANISM: [self-maintenance method]
TRANSFORMATION: "The Field was ___. The Identity is ___."
SUCCESS TEST: [criteria evaluation]
GOAL ALIGNMENT: [confirmed / gap identified]
```

### Full Execution Template

```
=== DISCOVERY INPUT ===

## FIELD (Objective Terms)
{{FIELD_INPUT}}

## CONSTRAINTS (Hard Limits)
{{CONSTRAINTS}}

## TARGET IDENTITY (Goal)
{{IDENTITY_GOAL}}

=== OPERATOR EXECUTION ===

[1. FIELD]
{{Execute Field operator}}
---CHECKPOINT---

[2. DISTINCTION]
{{Execute on Field output}}
---CHECKPOINT---

[3. DIRECTION]
{{Execute on Distinction output}}
---CHECKPOINT---

[4. CONSTRAINT]
{{Execute on Direction output}}
---CHECKPOINT---

[5. ACTION]
{{Execute on Constraint output}}
---CHECKPOINT---

[6. PATTERN]
{{Execute on Action output}}
---CHECKPOINT---

[7. IDENTITY]
{{Execute on Pattern output}}
{{Verify against IDENTITY_GOAL}}

=== FINAL MODERATION ===
- Recursion: Anchor verification
- Interpretation: Priority coverage check
- Observation: Trajectory = Converging confirmed

=== OUTPUT ===
IDENTITY NAME: {{result}}
TRANSFORMATION: {{statement}}
MODERATION STATUS: {{all checks passed}}
```

---

## 10. Script Interface

### Function Signature

```python
solve(
    field: str,      # Problem statement
    identity: str,   # Goal state to build
    constraints: str = None,  # Hard limits (optional)
    checkpoint_chars: int = 2000  # Characters between moderator reviews
) → Solution
```

### Command Line Usage

```bash
python solve.py \
  --field "problem statement" \
  --constraints "limit1, limit2" \
  --identity "goal state" \
  --checkpoint 2000

python solve.py --interactive
```

### Programmatic Interface

```python
from solve import AgentSystem

system = AgentSystem(checkpoint_chars=1500)
result = system.execute(
    field="Revenue scales with volume but leadership can't",
    constraints="- Cannot reduce volume\n- Cannot add headcount",
    identity="Self-governing distribution system",
    provider="anthropic"  # or "openai", "groq"
)
```

### LLM Provider Support

| Provider  | Model Default                  |
|-----------|--------------------------------|
| anthropic | claude-sonnet-4-20250514       |
| openai    | gpt-4                          |
| groq      | llama-3.3-70b-versatile        |

---

## Quick Reference Summary

| Layer          | Agents        | Function       |
|----------------|---------------|----------------|
| **Mission**    | Organization  | Purpose        |
| **Governance** | Division      | Selection      |
| **Execution**  | Operators 1-7 | Transformation |
| **Moderation** | Agents 8-10   | Stability      |

**One Sentence:**

> Governance selects a Field; Operators collapse it into Identity; Moderators ensure coherence; Governance validates against Mission.

---

## Framework Properties

| Property             | Execution Layer            | Moderator Layer                |
|----------------------|----------------------------|--------------------------------|
| **Mode**             | Sequential                 | Parallel/Supervisory           |
| **Function**         | Transform Field → Identity | Ensure transformation is sound |
| **Failure Response** | Halt and report            | Intervene and correct          |
| **Output**           | Structured solution        | Verification report            |

**Soundness Guarantee:** If all operators complete AND all moderators pass, the Identity necessarily resolves the Field and aligns with the target goal.

---

*Framework Version: 2.0.0*
*Architecture: Mission → Governance → Execution → Moderation*
*Sources: Agent Division System, Agent Branch System, Agent Contributor System*
