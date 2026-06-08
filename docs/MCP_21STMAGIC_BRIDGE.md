# MCP 21stmagic.dev Bridge

## Role

This MCP layer connects:

- BSDC Frontend V2 (ENGINEERING MAP)
- UI/UX Pro Max (design intelligence system)
- Claude Code (execution engine)

to 21stmagic.dev as UI assembly backend.

---

## Core Principle

21stmagic.dev is NOT a design system.

It is an **UI execution layer**.

It receives structured UI intent and outputs:

- component structure
- layout composition
- interaction behavior
- styling primitives

---

## Input Sources

### 1. ENGINEERING_MAP_STRUCTURE.md
Defines:
- nodes
- scroll position
- spatial hierarchy
- motion intent

### 2. UI/UX Pro Max
Defines:
- style rules
- typography
- color system
- UX constraints
- accessibility rules

---

## MCP Transformation Layer

Before sending anything to 21stmagic.dev:

### Step 1 — Normalize Node

Convert BSDC node into UI intent:

Example:

```ts
Node → UIIntent

{
  nodeId: "SERVICES_HUB",
  type: "spatial-hub",
  layout: "radial-network",
  depth: "multi-layer",
  interaction: "focus-branch",
  dataSource: "services CRUD"
}
Step 2 — Apply Design System

Inject UI/UX Pro Max rules:

typography rules
spacing rules
accessibility rules
motion constraints
color system (#8A9A86 base)
Step 3 — Convert to MCP Payload

Final payload structure:

{
  intent: "render-node",
  system: "bsd-frontend-v2",
  node: UIIntent,
  designSystem: "ui-ux-pro-max",
  constraints: {
    no-emojis: true,
    no-glass-dark-mode: true,
    motion: "gsap-compatible",
    accessibility: "WCAG-AAA-target"
  }
}
Output from 21stmagic.dev

Expected response:

component tree
layout structure
style tokens
interaction handlers
responsive rules

NO business logic.

NO CMS logic.

Responsibilities Split
Claude Code (Execution Orchestrator)
reads ENGINEERING_MAP
builds node system
triggers MCP calls
integrates results
21stmagic.dev (UI Builder)
generates UI structure
applies design system
returns components
UI/UX Pro Max (Rule Engine)
validates design
enforces constraints
prevents bad UI patterns
Critical Rule

21stmagic.dev MUST NOT:

define architecture
define scroll system
define node system
define CMS mapping

It only renders UI from intent.

Success Criteria

System is correct if:

ENGINEERING_MAP defines structure
UI/UX Pro Max defines rules
21stmagic.dev only builds UI
Claude Code acts as orchestrator

No layer overlaps.