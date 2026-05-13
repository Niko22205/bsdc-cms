TASK: Public website correction pass 2 after previous revision

CONTEXT:
This is a follow-up correction pass after the previous public website repair task.

Do not rebuild from scratch.
Do not change Prisma schema.
Do not create migrations.
Do not touch admin CMS logic.
Do not start SEO.
Do not deploy.
Do not invent fake content.
Keep BG/EN routing working.
Use existing CMS data.
Use only local media paths: /uploads/bsdc/*

IMPORTANT:
Several issues from the previous task are still not fixed.
This pass must focus on actual functionality, stable transitions, better service detail presentation, correct project/news loading, and contact/footer fixes.

==================================================
1. HERO SECTION — BROKEN CTA
==================================================

Problem:
One CTA in the Hero section still does not work.
The broken CTA is the one that should lead to “За нас”.

Requirements:
- Fix the Hero CTA that links/scrolls to the About section.
- Make sure it works on desktop and mobile.
- Make sure the target anchor is correct.
- Make sure the CTA is not blocked by overlay, z-index, animation wrapper, pointer-events, or disabled state.
- Test both Hero buttons after the fix.

Expected result:
Both Hero CTA buttons work correctly, including the one that scrolls to “За нас”.

==================================================
2. ABOUT SECTION — DOUBLE TRANSITION / FLICKER
==================================================

Problem:
The About section still has a double transition:
- it loads
- disappears
- loads again

Requirements:
- Fix the double animation/flicker in the About section.
- Audit the animation wrapper, scroll reveal component, Framer Motion initial/animate states, and IntersectionObserver logic.
- Remove repeated reveal triggers.
- Do not allow the section to render visible, then hide, then animate again.
- Use one clean reveal only.
- Respect reduced-motion preference.

Expected result:
About section appears once, smoothly, without disappearing and reappearing.

==================================================
3. SERVICES SECTION — FUNCTIONALITY AND PRESENTATION ISSUES
==================================================

Problems:
- Services section still has double transition:
  - loads
  - disappears
  - loads again
- Cube does not disappear or transition away properly when a service is selected.
- After selecting a service, there is no clear working way to return back to the cube.
- “X” close button does not work / cannot be clicked.
- Service detail pages/panels have no meaningful transition.
- Service details have no depth or 3D feeling.
- Details are too standard: image + text only.
- All services look too similar.
- Cube is still transparent.
- Services inside the cube are difficult to select.

Requirements:
- Fix the Services section double transition/flicker.
- Cube must be fully opaque.
- Cube faces must not be transparent.
- Service labels/items inside the cube must be easy to click/select.
- Make sure pointer events, z-index, overlays and transforms do not block service selection.
- When a service is selected:
  - cube should transition away or move into background intentionally
  - selected service detail should appear with a premium transition
  - user must clearly understand they entered service detail mode
- Add a working “X” close button:
  - must be clickable
  - must return user back to the cube/service overview
  - must work on desktop and mobile
- Add another clear “Back to services” control if needed.
- Do not leave the user trapped inside a service detail view.

Service detail presentation requirements:
Each service detail must feel richer and less generic.

Each service detail should include:
- service title
- short intro
- main image
- gallery strip or gallery grid with several images if available
- key activities as ordered or unordered list
- at least one visual card group / capability cards / technical highlights
- better spatial layout, not just image + paragraph
- premium motion/depth transition
- mobile-friendly layout

Important:
Do not make all six service detail layouts identical.
They can share a base component, but visual arrangement should vary enough to feel custom.

Suggested variation:
- Industrial diving: strong technical image, dark panel, capability cards, list of operations
- ROV: more technical/robotic layout, equipment cards, inspection use cases
- Bathymetry: map/survey feeling, data cards, sonar/gallery presentation
- Dam operator: documentation/control layout, process cards, compliance/technical blocks
- Dry hydrotechnical works: construction/metalwork layout, before/after/gallery feeling
- NAUI/CMAS courses: lighter training layout, course levels, experience cards, gallery

Expected result:
Services section becomes usable and visually premium:
cube works, service selection works, close/back works, details have galleries, cards, lists, transitions, depth and variation.

==================================================
4. PROJECTS / NEWS SECTION — NOT FIXED
==================================================

Problems:
- Projects section still has double transition/flicker.
- It still shows only 6 projects.
- Requirement was to show projects in groups of 2, not only 6 total.
- There is no proper horizontal scroll/book effect.
- There is no contents/index page with projects.
- Correct projects from the old site were not properly imported/populated.
- Suitable images from the old project links were not added.
- The section still does not feel like a diary/book/archive.
- Project modal “X” close button does not work.
- The only way to exit the modal is clicking outside it.

Requirements:
- Fix the Projects/News section double transition/flicker.
- Load all available project/news items from CMS, not only the first 6.
- If there is a query limit, pagination limit, slice(0, 6), hardcoded cap, or frontend filtering cap, remove/fix it.
- Display projects in groups/pages of 2 items.
- Add horizontal navigation with book/page-turn feeling.
- Add old technical diary/archive book visual direction.
- Add a contents/index view or contents-style navigation listing available projects.
- Add category filters if categories exist in CMS.
- Each project card must have:
  - title
  - short summary
  - image if available
  - category/date if available
  - “Прочети повече”
- Project detail modal must include:
  - working “X” close button
  - title
  - full text
  - gallery/images if available
  - previous/next project controls if possible
- “X” close button must be clickable and must not be blocked by z-index, overlay, transform, or pointer-events.
- Clicking outside can remain as secondary close behavior, but must not be the only way to close.

Content requirements:
- Populate only real projects/news from the old BSDC website sources already provided in the previous task.
- Use suitable images from the imported local media where available.
- Do not use unrelated images.
- Do not use external stock images.
- Do not invent missing project facts.

Expected result:
Projects/News becomes a real archive section:
all imported items are reachable, shown two per page, with book-style navigation, contents/index, correct images and working modals.

==================================================
5. CONTACT SECTION AND FOOTER
==================================================

Problems:
- Contact section still has double transition/flicker.
- Footer text is too small and almost unreadable.
- Google Maps is still not visible on the public site.
- A Google Maps link has already been added in the CMS and must be rendered publicly.

Requirements:
- Fix Contact section double transition/flicker.
- Render the Google Maps link/embed from CMS settings on the public Contact section.
- Do not hardcode a fake address.
- Use the CMS-provided Google Maps link.
- If the CMS value is a Google Maps embed URL, render it as an iframe.
- If the CMS value is a normal Google Maps share link, either:
  - convert/render it correctly if current code supports it, or
  - show a clear “Вижте в Google Maps” button/link and document why iframe is not possible.
- Footer font size must be increased.
- Footer text must be readable on desktop and mobile.
- Legal links must remain visible and usable.
- Footer should stay premium and clean, not tiny and hidden.

Expected result:
Contact section renders the CMS Google Maps link, footer text is readable, and contact/footer transitions are stable.

==================================================
6. GLOBAL TRANSITION FIX — STILL NOT SOLVED
==================================================

Problem:
Multiple sections still have the same bad behavior:
- section loads
- disappears
- loads again

Affected sections:
- About
- Services
- Projects/News
- Contact
- possibly other animated sections

Requirements:
- Treat this as a global animation bug, not isolated visual polish.
- Audit shared reveal components.
- Check ScrollReveal / motion wrappers / initial opacity classes / hydration behavior.
- Remove conflicting CSS transitions and Framer Motion animations.
- Make reveal animation run once only.
- Prevent animation from resetting when state changes, language changes, selected service changes, modal opens, or section re-renders.
- Ensure initial server/client render does not cause visible flicker.
- On mobile, reduce or disable heavy transitions if they cause instability.

Expected result:
No public section should appear, disappear, and appear again.

==================================================
FINAL ACCEPTANCE CHECKLIST
==================================================

Before finishing, verify:

Hero:
- CTA to “За нас” works.
- Both hero buttons are clickable.

About:
- No double transition.
- No flicker.

Services:
- No double transition.
- Cube is opaque.
- Cube services are easy to select.
- Cube transitions properly when service opens.
- Service detail opens with premium motion.
- “X” close button works.
- User can return to cube.
- Service pages/panels have galleries, cards, lists and visual variation.
- Service layouts are not all identical.

Projects/News:
- No double transition.
- More than 6 items can be reached.
- Items are shown in groups/pages of 2.
- Book/page-turn navigation exists.
- Contents/index view exists.
- Correct old BSDC projects/news are populated.
- Relevant local images are used.
- “Прочети повече” exists.
- Modal “X” close button works.
- Clicking outside is not the only close method.

Contact/Footer:
- No double transition.
- CMS Google Maps link is rendered publicly.
- Footer font size is readable.
- Legal links remain visible.

Global:
- No schema changes.
- No migrations.
- No SEO work.
- No fake content.
- No external stock images.
- BG/EN routing still works.