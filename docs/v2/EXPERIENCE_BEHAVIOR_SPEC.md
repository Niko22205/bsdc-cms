# BSDC FRONTEND V2 — EXPERIENCE BEHAVIOR SPEC

Status: LOCKED

---

# CORE PRINCIPLE

This document defines HOW the system behaves.

Not how it looks.

Not how it is structured.

But how it is experienced in time.

---

# 1. CAMERA BEHAVIOR

## 1.1 Continuous Movement

The camera is ALWAYS active.

There is no static state.

There is no idle “page”.

---

## 1.2 Travel Logic

Between nodes:

- camera moves smoothly along the route
- movement is continuous, not stepped
- no instant jumps allowed (except menu override)

---

## 1.3 Zoom System

The camera has 3 implicit states:

### Transit
- zoom out
- reduced detail
- softened depth separation

### Arrival
- zoom in
- increased clarity
- strongest node contrast

### Focus Hold
- slight stabilization
- micro easing (breathing feel)
- minimal drift allowed

---

## 1.4 Motion Rules

Allowed:

- inertia-based movement
- GSAP scrub transitions
- smooth easing (power2 / power3)

Forbidden:

- teleporting
- instant section switching
- abrupt cuts
- slideshow transitions

---

# 2. CURSOR BEHAVIOR

## 2.1 Cursor is NOT interaction driver

Cursor does NOT:

- control navigation
- control camera position
- trigger layout changes

---

## 2.2 Cursor is a local field influence

Cursor ONLY affects:

- micro distortion of geometry
- subtle parallax offset
- depth perception bias

---

## 2.3 Cursor intensity rules

- near center → almost no effect
- near edges → slightly stronger drift
- max influence never exceeds 5–8px visual shift

---

## 3. NODE ACTIVATION BEHAVIOR

## 3.1 Activation rule

A node becomes ACTIVE when:

camera distance to node < threshold

---

## 3.2 States

Each node has 3 states:

### FAR
- low opacity
- reduced scale
- minimal contrast

### NEAR
- increasing clarity
- depth separation becomes visible

### ACTIVE
- full clarity
- strongest depth separation
- foreground elements dominate

---

## 3.3 Transition rule

Node transitions must be:

- continuous
- gradual
- camera-driven only

NOT event-driven UI swaps.

---

# 4. DEPTH BEHAVIOR SYSTEM

Each node contains 3 layers:

## Background
- slowest movement
- almost static perception

## Midground
- main structural content
- moderate parallax

## Foreground
- text and interactive elements
- highest stability

---

## Depth rule

Foreground must NEVER drift enough to impair readability.

---

# 5. SERVICES HUB BEHAVIOR

## 5.1 Entry

When entering Services Hub:

- camera slows down
- central hub becomes dominant
- branches begin to emerge visually

---

## 5.2 Branch system

Each service is a spatial branch.

Inactive branches:

- reduced contrast
- reduced scale
- visually pushed back

Active branch:

- increased scale
- increased depth
- becomes focal direction

---

## 5.3 Interaction

On hover:

- branch gains depth
- slight forward motion
- surrounding branches recede slightly

On click:

- branch becomes active route
- camera locks onto branch node
- other branches fade into peripheral depth

---

# 6. PROJECT RAIL BEHAVIOR

## 6.1 Continuity rule

Project rail is NOT replaced or re-rendered.

It is continuously visible as a spatial structure.

---

## 6.2 Movement

- horizontal progression driven by scroll
- no fade transitions between items
- modal opens in place (no scene change)

---

## 6.3 Modal behavior

Project modal:

- overlays without breaking world continuity
- background remains visible in depth
- no full-screen replacement allowed

---

# 7. MENU BEHAVIOR

## 7.1 Global navigation

Menu click MUST:

- initiate camera travel
- preserve world continuity
- never jump instantly

---

## 7.2 Service navigation

Service selection:

- moves camera to Services Hub
- activates selected branch
- locks focus state

---

# 8. ARRIVAL MOMENTS

Each node has an “arrival feel”:

- gradual increase in clarity
- slight deceleration of camera
- depth separation becomes visible
- foreground stabilizes first, background last

---

# 9. DEPARTURE MOMENTS

When leaving a node:

- foreground loses dominance first
- midground follows
- background lingers longest
- camera accelerates gently into transit

---

# 10. VISUAL MOTION LANGUAGE

Allowed visual behaviors:

- parallax depth
- spatial scaling
- camera-based perspective shift
- slow geometric drift

Forbidden visual behaviors:

- particles
- glow effects
- scanlines
- HUD overlays
- glitch effects
- animated decoration layers

---

# 11. SUCCESS DEFINITION

The system is correct if:

- user feels movement through space, not screens
- there is no sense of “page change”
- camera feels like physical presence
- content feels embedded in environment
- navigation feels like route discovery
## 12. NAVIGATION VISUAL RULE (CRITICAL UPDATE)

The system MUST behave as POV traversal.

---

### 12.1 Camera Model

Camera is first-person oriented perception.

NOT:

- top-down map
- overview layout
- guided path visualization

---

### 12.2 Movement Experience

Movement between nodes must feel like:

- entering a space
- not moving along a line

The path is NOT visible.

The route is NOT shown.

Only transitions are perceived.

---

### 12.3 Forbidden Experience Types

- treasure map navigation
- visible node graph
- line-based routing visualization
- gallery progression
- slideshow sequencing

---

### 12.4 Required Experience Type

POV traversal:

- you are “inside” each node
- transitions feel like physical relocation
- no awareness of global structure