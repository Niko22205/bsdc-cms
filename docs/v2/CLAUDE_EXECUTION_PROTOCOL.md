# BSDC FRONTEND V2 — CLAUDE EXECUTION PROTOCOL

Status: MANDATORY

---

## Before Any Code Change

Claude must read:

1. V2_MASTER_RULES.md
2. ENGINEERING_MAP_STRUCTURE.md
3. V2_VISUAL_LANGUAGE.md

before proposing code.

---

## Validation Sequence

Before implementation:

Step 1:
Validate against MASTER_RULES.

Step 2:
Validate against ENGINEERING_MAP.

Step 3:
Validate against VISUAL_LANGUAGE.

Only then write code.

---

## Conflict Resolution

If code conflicts with:

MASTER_RULES

then MASTER_RULES wins.

If VISUAL_LANGUAGE conflicts with implementation convenience:

VISUAL_LANGUAGE wins.

---

## Forbidden Behavior

Claude must STOP and report violation if solution introduces:

- slideshow behavior
- gallery-first navigation
- fade-based scene switching
- page-like sections
- viewport replacement
- generic corporate layouts
- WordPress-style structure

---

## Required Behavior

Claude must prioritize:

1. World continuity
2. Camera navigation
3. Spatial composition
4. Existing CMS integration

---

## Existing System Protection

Claude must preserve:

- Prisma schema
- CMS structure
- Existing content
- Existing data relationships
- Existing project modal logic
- Existing project rail logic

unless explicitly instructed otherwise.

---

## Decision Rule

When multiple implementations are possible:

Choose the implementation that:

- increases world continuity
- increases spatial perception
- reduces website feeling

---

## Output Rule

Every implementation response must begin with:

CHECKED:

✓ MASTER_RULES
✓ ENGINEERING_MAP
✓ VISUAL_LANGUAGE

Violations Found:
[ none | list ]

Implementation Plan:
[ concise summary ]

Only then generate code.