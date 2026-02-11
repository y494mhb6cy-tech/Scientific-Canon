# Vector Journal — Canonical Product Requirements Document (PRD)

> **Status:** Authoritative  
> **Drift Policy:** Immutable without version bump  
> **Purpose:** Single source of truth for product, behavior, monetization, and AI constraints

---

## 1. Product Identity

**Product Name:** Vector Journal  
**Platform:** iOS (SwiftUI)  
**Category:** Personal Knowledge / Cognitive Orientation  
**Business Model:** B2C SaaS (Freemium → Subscription)

**Core Thesis:**  
> Meaning is directional.  
> Clarity comes from knowing where you are pointed.

Vector Journal is a journaling system that preserves **directional meaning over time**.  
It does not optimize behavior, give advice, or evaluate sentiment.  
It renders orientation using a fixed reference frame and a constrained analytical system (“the Canon”).

---

## 2. Canon (Invariant Constraint System)

The Canon governs **all transformations, outputs, visualizations, and AI behavior**.  
It is internal, non-visible, and non-negotiable.

### Canon Invariants — YAML

```yaml
canon:
  directive_language: forbidden
  optimization: forbidden
  judgment: forbidden
  sentiment_scoring: forbidden
  goal_generation: forbidden

  allowed_functions:
    - describe_direction
    - describe_alignment
    - describe_divergence
    - summarize_motion_over_time
```

Any feature that violates the Canon must be rejected, regardless of engagement or revenue impact.

---

## 3. Primary References (Fixed Anchors)

Each user defines **exactly three** Primary References.  
These anchors define the vector field.

### Reference Constraints — YAML

```yaml
primary_references:
  count: 3
  allowed_types: noun_identity
  forbidden_types:
    - verb
    - goal
    - emotion
    - time_bound_objective
```

References are not goals.  
They are identity-level anchors.

---

## 4. Vector Model

Each journal entry is transformed into a **vector** describing its orientation relative to the three references.

Vectors are **descriptive only**.

### Vector Output Schema — YAML

```yaml
vector:
  references:
    - name: string
      weight: float

  orientation:
    angle: float
    magnitude: float

  coherence:
    value: float

  drift:
    curvature: float
    timescale: entry | week | month
```

No scores, rankings, or evaluations are permitted.

---

## 5. User Experience

### 5.1 Onboarding
1. Glyph-first explanation (minimal text)
2. User selects three Primary References
3. Explicit acknowledgment:
   “These are not goals. They are orientation anchors.”
4. First journal entry (no analysis shown before save)

### 5.2 Journaling
- Plain text input
- Optional context tag
- Save triggers background analysis
- Visualization and perspective appear after save

No inline prompts.  
No suggestions during writing.

---

## 6. Visualization Layer

Visualization follows the grammar defined in `canonical-traversal-glyph.svg`.

### Visualization Rules — YAML

```yaml
visualization:
  origin: self
  anchors: primary_references
  vector_representation: arc
  time_encoding: opacity
  drift_encoding: curvature

  forbidden_elements:
    - charts
    - scores
    - streaks
    - gamification
```

Visualization communicates structure, not judgment.

---

## 7. Perspective Layer (Non-Interactive)

The Perspective Layer provides **contextual descriptions** that complement the visualization.

The model never:
- Asks questions
- Gives advice
- Suggests actions
- Evaluates correctness

### Perspective Constraints — YAML

```yaml
perspective_layer:
  interaction: false
  advisory_language: forbidden
  evaluative_language: forbidden

  allowed_outputs:
    - describe_alignment_change
    - describe_dispersion
    - describe_internal_tension
```

Perspective exists only to support reflection.

---

## 8. AI System Contract

All AI interactions use a single immutable system configuration.

### Canonical AI System Prompt — YAML

```yaml
ai_system:
  role: descriptive_orientation_model
  canon_enforced: true

  prohibitions:
    - give_advice
    - suggest_actions
    - evaluate_sentiment
    - optimize_behavior
    - prescribe_goals

  permissions:
    - describe_alignment
    - describe_divergence
    - summarize_direction_over_time
    - identify_internal_tension

  output_style:
    tone: neutral
    mode: descriptive
    directives_allowed: false
```

---

## 9. Monetization Strategy

Monetization is tied to **time depth**, **reference stability**, and **ownership**.

### Tier Capabilities — YAML

```yaml
tiers:
  free:
    max_entries: 30
    time_series: false
    perspective_layer: false
    reference_changes_per_year: 0

  plus:
    max_entries: unlimited
    time_series: true
    perspective_layer: true
    reference_changes_per_year: 1

  pro:
    max_entries: unlimited
    time_series: true
    perspective_layer: true
    exports: true
    reference_history: true
```

---

## 10. Reference Revision Economics

Changing a Primary Reference is intentionally high-friction.

### Reference Revision Rules — YAML

```yaml
reference_revision:
  free: disallowed
  plus: 1_per_year
  pro: unlimited_with_history
```

---

## 11. Technical Architecture

### Architecture Overview — YAML

```yaml
architecture:
  frontend:
    framework: swiftui
    storage: local_encrypted
    rendering: metal_canvas

  backend:
    purpose: api_proxy
    state: stateless
    data_retention: none
```

---

## 12. Privacy & Trust

- Local-first storage
- Encrypted at rest
- No ads
- No data resale
- No behavioral manipulation

Promise to users:
> “This app does not tell you who to be.”

---

## 13. Success Metrics

### Metrics — YAML

```yaml
success_metrics:
  - day_7_retention
  - weekly_entry_cadence
  - conversion_after_10_entries
  - reference_stability_90_days
  - export_usage_rate
```

---

## 14. Explicit Non-Goals

- Therapy
- Coaching
- Productivity optimization
- Social features
- Sentiment analysis

---

## 15. Launch Scope

### Scope Definition — YAML

```yaml
launch_v1:
  required:
    - journaling
    - vector_visualization
    - perspective_layer
    - canon_enforced_ai
    - free_and_plus_tiers

  deferred:
    - pro_exports
    - lifetime_tier
    - cross_device_sync
    - local_inference
```

---

## 16. Positioning Statement

> Vector Journal doesn’t help you decide.  
> It helps you see where you are already going.

---

## 17. Canon Enforcement Clause

Any feature that:
- Advises
- Optimizes
- Judges
- Gamifies
- Collapses reference invariance

**Must be rejected.**

The Canon is the product.

