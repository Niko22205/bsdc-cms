# BSDC — DESIGN SYSTEM LOCK (v1 SINGLE LANGUAGE RULE)
⚠️ ЦЕЛ

Този документ заключва визуалния език на целия сайт.

Той НЕ е за експерименти.
Той НЕ се override-ва per scene.
Той НЕ се “интерпретира”.

👉 Това е единственият allowed визуален слой.

1. ❌ ЗАБРАНЕНО (HARD RULES)

Следното е абсолютно забранено:

❌ различни стилове per scene
❌ random gradients
❌ “retro”, “glitch”, “80s”, “journal”, “brutalist mix” локално
❌ черен фон като default решение за “драма”
❌ font-bold / font-semibold (TOTAL BAN)
❌ повече от 2 font families
❌ custom colors извън palette
❌ scene-specific design themes
2. 🎨 ЕДИНСТВЕНА ЦВЕТОВА СИСТЕМА
Primary surfaces
Background Dark: #0F1411
Background Secondary: #1A232A
Surface Light: #F5F3EF
Accents
Primary Accent: #FFE500
Secondary Accent (industrial): #B87333
Text
On dark: #F5F3EF
On light: #0F1411
3. 🧠 ВИЗУАЛНА ЛОГИКА
ВСИЧКИ сцени = един продукт

Разлики между сцени:

✔ content
✔ layout density
✔ media type

❌ НЕ:

стил
фонова философия
типографски език
цветови експерименти
4. 🔤 ТИПОГРАФИЯ (ЕДИНСТВЕНА СИСТЕМА)
Display font
Space Grotesk / Syne
weight: ONLY 300 / 400
Mono font
Geist Mono
RULES
❌ no bold
❌ no semibold
❌ no mixed font systems per scene
✔ hierarchy = size + spacing ONLY
SCALE
Headlines
text-[3.5rem] md:text-[5.5rem]
font-thin
tracking-[-0.03em]
leading-[0.95]
Body
text-[15px]
font-light
leading-[1.8]
Labels
text-[10px]
uppercase
tracking-[0.3em]
font-mono
Accents
color: #FFE500 / #B87333
NO decoration styles
5. 🌍 BACKGROUND SYSTEM
RULE

Background is NOT per scene design.

It is a system layer.

Allowed:

solid color
subtle gradient derived from palette
global Three.js background (optional)

❌ Forbidden:

image backgrounds per scene
sepia scenes
journal textures
“creative overlays” per section
6. 🎬 MOTION LANGUAGE (GSAP ONLY)
Allowed motion types
opacity fade
transform translate
scale subtle
cross-dissolve scene switching
GLOBAL RULE

All scene transitions:

duration: 1.4s
ease: power2.inOut
overlap: TRUE
Forbidden motion
physics randomness
per-scene animation styles
inconsistent easings
layout-based animation shifts
7. 🧩 SCENE PRINCIPLE

Scenes are NOT design systems.

Scenes are ONLY:

content containers
layout arrangements
media presentation modes
Each scene must:

✔ use same typography system
✔ use same color system
✔ use same motion system
✔ differ only in structure

8. 🧱 COMPONENT RULE

All components MUST:

inherit global design tokens
NOT define their own visual identity
NOT override typography rules
NOT introduce new accent colors
9. 🧭 UX CONSISTENCY RULE

Navigation is not a UI feature.

It is a control system.

goToScene() only
no alternative routing logic
no scroll behavior override variations
10. ⚙️ FINAL ARCHITECTURE DEFINITION

This system is:

👉 One viewport
👉 One motion engine
👉 One design language
👉 Multiple content scenes

NOT:

website
page system
UI playground
design experiment
11. 🧨 GOLDEN RULE (IMPORTANT)

If a visual idea cannot fit into this system — it does NOT exist.