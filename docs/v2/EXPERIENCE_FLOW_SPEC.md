# BSDC FRONTEND V2 — EXPERIENCE FLOW SPEC

Status: LOCKED

---

# 0. ENTRY STATE

User enters system.

## Step 0.1 — Loader

A minimal loading state:

- no animation-heavy UI
- no branding sequence
- simple progress indication only

Purpose:
wait for CMS + world initialization

---

# 1. HERO NODE (ENTRY EXPERIENCE)

## 1.1 Structure

Full viewport spatial scene.

Contains:

- logo (anchored top-left)
- company name (anchored lower-left)
- slogan (central or slightly offset focal point)

---

## 1.2 Visual Requirement

Hero MUST feel:

- alive
- spatial
- physically present

NOT:

- static text on background
- banner layout
- centered marketing block

---

## 1.3 Motion Rules

Allowed:

- subtle background geometry drift
- parallax depth layers
- micro cursor influence on geometry only

Forbidden:

- UI animation loops
- decorative effects (glow, particles, scanlines)

---

# 2. ABOUT NODE (DOWNWARD FLOW)

## 2.1 Transition

Scroll moves camera DOWN into About node.

---

## 2.2 Structure

- narrative content
- images
- factual information

---

## 2.3 Spatial Rule

Content MUST be distributed in depth:

- text in foreground
- images in midground
- contextual history in background

---

## 2.4 Horizontal Drift Rule

While scrolling:

camera may shift slightly RIGHT to reveal secondary About content layer.

This is NOT a new page.

This is same node, different spatial axis.

---

# 3. SERVICES NODE (BRANCHING SYSTEM)

## 3.1 Entry

Scroll arrives at Services Hub.

---

## 3.2 Structure

6 service branches:

- Diving
- ROV
- Bathymetry
- Dams
- Construction
- Courses

---

## 3.3 Visual Behavior

Services are:

- spatial nodes in a network
- NOT cards
- NOT list items

---

## 3.4 Interaction Model

On scroll:

- services are only “passed through”
- no full engagement

On click:

- service becomes ACTIVE NODE
- camera locks onto service
- dedicated service layout loads

---

## 3.5 Service Layout Rule

Each service has its own layout.

BUT:

- world is NOT replaced
- camera remains active
- system stays spatial

---

# 4. PROJECT NODE (RAIL SYSTEM)

## 4.1 Structure

Projects are rendered as:

- curved / arc rail system
- spatial progression path

---

## 4.2 Interaction

Scroll:

- moves along rail

Click:

- opens project modal

---

## 4.3 Modal Rule

Modal:

- overlays in-place
- does NOT replace world
- background remains visible in depth

---

# 5. CONTACT NODE

## 5.1 Structure

Minimal spatial endpoint.

---

## 5.2 Behavior

- camera slows down
- motion dampens
- interaction simplifies

---

# 6. FOOTER NODE

Final state of system.

- route ends
- no further navigation beyond this point

---

# 7. GLOBAL NAVIGATION (MEGA MENU)

## 7.1 Behavior

Menu click:

- triggers camera travel to target node
- does NOT instantly switch views

---

## 7.2 Service Shortcut Rule

If service selected from menu:

1. camera moves to Services Hub
2. selected service becomes ACTIVE
3. service layout opens

---

# 8. CORE EXPERIENCE RULE

System MUST always behave as:

- continuous spatial traversal

NOT:

- section jumping
- page switching
- UI replacement system