V2 EXECUTION GUARD — HARD RULES (NON-OVERRIDABLE)

This file is NOT documentation.

It is a build-time execution constraint.

If any rule is violated → implementation is INVALID.

---

# 1. FORBIDDEN PATTERNS (ABSOLUTE)

The system MUST NOT contain:

- gallery behavior
- slideshow transitions
- page-to-page navigation
- section switching UI
- map / node graph visualization
- SVG route lines as navigation
- waypoint-based camera movement
- list/grid as primary structure for services

---

# 2. CAMERA RULE (STRICT)

Camera MUST be:

- continuous function of scroll
- no discrete steps
- no node index logic
- no array-based traversal
- no interpolation between “points”

---

# 3. NODE RULE

Nodes are NOT destinations.

Nodes are spatial content zones inside ONE continuous world.

Nodes MUST NOT trigger:
- route changes
- view changes
- layout replacement
- modal navigation logic

---

# 4. SERVICES RULE

Services MUST be:

- spatial points in same environment
- NOT list
- NOT grid
- NOT radial SVG graph
- NOT menu structure

Clicking service:

→ only changes camera focus
→ does NOT change scene

---

# 5. WORLD RULE

There is ONLY ONE WORLD.

- no screens
- no pages
- no sections
- no transitions between layouts

---

# 6. RENDER RULE

UI must behave like:

POV movement through one physical space.

NOT:

- UI state changes
- component swapping
- screen transitions

---

# 7. VALIDATION RULE

If output resembles:

- slideshow
- treasure map
- gallery navigation
- multi-screen website

→ REJECT AND REWRITE