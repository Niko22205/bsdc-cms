# ENGINEERING_MAP_STRUCTURE.md

## BSDC FRONTEND V2 — ENGINEERING MAP CORE

Status: Implementation Blueprint (Claude Code Target Spec)
Role: This document is the source of truth for spatial layout + scroll engine architecture.

---

# 1. SYSTEM OVERVIEW

Frontend V2 is a single continuous spatial scroll system.

Not pages.
Not sections.
Not components.

It is a linear engineering route mapped onto a single SVG path.

User experience is driven by:

- Scroll position
- Node activation
- Depth layering
- Path progression

---

# 2. GLOBAL ARCHITECTURE

## Core Concept

A single continuous scroll-driven world:

- One Scroll Container (100% vertical flow)
- One SVG Path (global route line)
- Multiple Spatial Nodes (interactive clusters)
- One Camera System (GSAP ScrollTrigger driven)

---

## Core Systems

### 2.1 Scroll Engine
- GSAP ScrollTrigger
- Single pinned master container
- Scroll drives:
  - path progress (0 → 1)
  - node activation
  - parallax depth shifts

---

### 2.2 SVG LINE SYSTEM (CRITICAL)

There is ONE continuous SVG path:

- starts: HERO
- ends: FOOTER

It controls:
- visual route drawing
- navigation state
- node activation thresholds

Path is NOT decorative.
It is the navigation backbone.

---

### 2.3 NODE SYSTEM

Nodes are spatial clusters, not sections.

Each node has:

```ts
type Node = {
  id: string
  position: number // 0.0 → 1.0 along path
  depthLayers: {
    background: number
    midground: number
    foreground: number
  }
  motionProfile: "parallax" | "focus" | "expand" | "network"
  cmsSource: string
}
3. NODE MAP (LINEAR ROUTE)
NODE 01 — HERO

position: 0.0

depth:
background: low motion noise layers
midground: technical curves
foreground: title + logo
motion:
parallax + cursor response
CMS:
static + settings
NODE 02 — ABOUT

position: 0.15

concept: temporal engineering map
layers:
background: timeline visuals
mid: images
foreground: text blocks
motion:
depth separation on scroll
CMS:
About page content
NODE 03 — CERTIFICATES / CAPACITY

position: 0.30

concept: engineering documents table
layout:
spatial document placement (NOT grid)
motion:
hover lift + depth pop
CMS:
Certificates CRUD
NODE 04 — PARTNERS

position: 0.42

concept: route markers
layout:
point-based network nodes
motion:
subtle zoom on activation
CMS:
Partners CRUD
NODE 05 — SERVICES HUB (CORE NODE)

position: 0.60

concept: central engineering hub
structure:
radial / network branching system

services:

Diving
ROV
Bathymetry
Dams
Construction
Courses
interaction:
selecting service:
→ becomes active route branch
→ others fade
→ camera focus shifts
CMS:
Services CRUD + gallery images
NODE 06 — PROJECT RAIL

position: 0.78

concept: existing project system preserved
structure:
horizontal rail inside spatial world
motion:
scroll-driven rail progression
CMS:
Projects CRUD (unchanged logic)
NODE 07 — CONTACT

position: 0.93

concept: terminal point
layout:
minimal spatial field
motion:
deceleration + settle
CMS:
Contact form system
NODE 08 — FOOTER

position: 1.0

concept: endpoint marker
static final state
4. DEPTH SYSTEM

Each node uses 3-layer rendering:

Background Layer
large shapes
blurred geometry
slow parallax
Midground Layer
structural content
images
informational blocks
Foreground Layer
text
interactive UI
focus elements
5. MOTION ENGINE RULES

ONLY GSAP:

ScrollTrigger
timeline-based transitions
scrubbed animations

FORBIDDEN:

random animations
floating UI gimmicks
particle effects
sci-fi HUD overlays
6. CAMERA MODEL (VIRTUAL)

The UI behaves like a camera:

scroll = camera movement along path
nodes = focus targets
depth = z-axis illusion

Rules:

only one active focus node at a time
others remain in peripheral depth
7. CMS BINDING RULES

Frontend must consume existing CMS only.

Mappings:

Services → NODE 05
Projects → NODE 06
Partners → NODE 04
Certificates → NODE 03
About → NODE 02
Contact → NODE 07
Settings → NODE 01

NO schema changes allowed.

8. PERFORMANCE RULES
no layout thrashing
GPU-friendly transforms only
minimal DOM overdraw
lazy load node content
9. SUCCESS CRITERIA

Frontend V2 is successful if:

scroll feels like navigation in a physical map
SVG line feels like structural backbone
nodes feel like spatial objects
no “website feel” remains
CMS data appears naturally embedded in space