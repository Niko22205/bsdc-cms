# BSDC PUBLIC WEBSITE — EMERGENCY STABILIZATION & REPAIR

## IMPORTANT CONTEXT

This is a serious stabilization task.

Do NOT treat this as a visual polish pass.
Do NOT start from scratch.
Do NOT blindly run seed.
Do NOT create new services.
Do NOT duplicate existing CMS records.
Do NOT delete or blank CMS media fields.
Do NOT change Prisma schema.
Do NOT create migrations.
Do NOT start SEO.
Do NOT deploy.
Do NOT use external images directly.
Use only local media paths: `/uploads/bsdc/*`.

The project is a custom CMS + public one-page BSDC website.
Current problem: recent code/seed changes caused media loss risk, duplicated service risk, broken service data assumptions, repeated project filters, messy contact layout, and missing/removed section images.

Before changing anything, inspect current code and explain what is wrong.

---

# PHASE 1 — READ CURRENT STATE BEFORE CODING

Inspect these files first:

- `prisma/schema.prisma`
- `prisma/seed.ts`
- `src/app/[lang]/page.tsx`
- `src/components/PageExperience.tsx`
- `src/components/3d/ServicesCube.tsx`
- admin Home/About/Settings form save logic if it exists
- any CMS update actions/API routes for Home/About/Settings/Services/Projects
- `src/app/globals.css` only if animation/media classes are relevant

Do NOT run seed yet.

Report internally before modifying:
1. Which fields store Hero image/background in CMS.
2. Which fields store About image/media in CMS.
3. Which fields store Service main image and gallery.
4. Which fields store Project/News type and category.
5. Whether current seed would create duplicate services.
6. Whether current seed would overwrite Hero/About media with empty/null.
7. Whether current service fetch includes image fields.
8. Whether current project filters mix type/category values.

---

# PHASE 2 — RESTORE HERO / ABOUT MEDIA SAFELY

## Problem

Hero and About images were removed from CMS section data / content logic.
This must be fixed in CMS data/content source, not only hidden with frontend fallback.

## Requirements

Find where Hero/About media fields were removed or overwritten.

Check:
- `prisma/seed.ts`
- Home Section seed
- About Section seed
- Settings seed
- admin save logic
- page data mapping in `src/app/[lang]/page.tsx`
- rendering in `PageExperience.tsx`

## Fix

Restore valid local media paths for:
- Hero image/background
- About image/media

Use only existing local files under:

```txt
/uploads/bsdc/*

Do not use external URLs.
Do not invent broken paths.
Do not leave empty image fields if suitable local media exists.

Protect media from future deletion

When seed or admin update logic touches Home/About/Settings:

do not overwrite existing image fields with null
do not overwrite existing image fields with ""
do not overwrite existing image arrays with []
preserve existing media when new value is undefined
only remove image if user explicitly removes it in admin
Frontend fallback

Hero/About rendering should be:

Use CMS image if present.
Else use safe local fallback from /uploads/bsdc/*.
Else render styled placeholder, not broken image.
Acceptance
Hero image/background is visible again.
About image is visible again.
CMS media fields are restored.
No broken image icons.
No external image URLs.
Future seed/admin save cannot accidentally blank images.
PHASE 3 — FIX SERVICES WITHOUT DUPLICATION
Problem

The final professional service names are correct.
The problem is that previous seed logic may create new services instead of updating existing ones.

Final service names

Keep exactly these 6 services:

Индустриални водолазни услуги
ROV инспекции и роботизирано обследване
Батиметрия, хидрография и сонарни обследвания
Оператор на язовири и съоръженията към тях
Хидротехническо строителство и сухи СМР
Водолазни курсове NAUI / CMAS

Do NOT revert to old names.

Mapping from old records

Update existing service records only:

Old Водолазни Услуги / diving-services
→ Индустриални водолазни услуги
Old ROV Услуги / rov-services
→ ROV инспекции и роботизирано обследване
Old Батиметрия и Хидрография
→ Батиметрия, хидрография и сонарни обследвания
Old Оператор на Микроязовири
→ Оператор на язовири и съоръженията към тях
Old Ремонти на Пристанища, Съдове и Язовири
→ Хидротехническо строителство и сухи СМР
Old Водолазни Курсове / diving-courses
→ Водолазни курсове NAUI / CMAS
Seed rule

Fix prisma/seed.ts so it updates existing records using stable existing unique keys/slugs.

Do NOT use newly invented slugs as where keys if that creates duplicate rows.

The seed must:

update title
update description/content
update featuredImageUrl if field exists
update images[] if field exists
update sort order 0–5
preserve media if no new media is provided
not create duplicate service rows
Service count rule

After cleanup/fix, expected public/CMS service count:

Exactly 6 BG live services

No 11 services.
No old + new duplicates.
No duplicate order pairs.

If duplicates already exist

If duplicate records already exist in local DB, do NOT blindly delete without reporting.

First report:

duplicate IDs/titles/slugs/keys
which original record should remain
which duplicate should be deleted/archived

Then provide safe cleanup action.

Acceptance
CMS Services list shows exactly 6 services.
Public Services menu shows exactly 6 services.
Footer Services list shows exactly 6 services.
Cube receives exactly 6 services.
Final titles are the professional titles listed above.
PHASE 4 — SERVICE IMAGES FROM CMS
Problem

Service galleries were moved to svc.images, but main/featured images may still be hardcoded, missing, or unsafe.

Requirements

Read Service model in prisma/schema.prisma.

Identify actual available fields:

featuredImageUrl
images
any other service image field

In src/app/[lang]/page.tsx, make sure services fetch includes:

title
slug/key
description/content
featuredImageUrl if it exists
images

In PageExperience.tsx, service main image should use:

svc.featuredImageUrl if present
else svc.images?.[0] if present
else styled placeholder

Gallery strip should use only:

svc.images

If svc.images is empty, gallery should render nothing or styled empty state.
No broken images.
No hardcoded service image paths.

Service image content

Use existing local BSDC images only:

/uploads/bsdc/*

Assign suitable media per service if available:

Индустриални водолазни услуги
underwater diver / industrial underwater work / hydrotechnical work
ROV инспекции и роботизирано обследване
ROV / underwater robot / inspection equipment
Батиметрия, хидрография и сонарни обследвания
sonar / survey / bathymetry / boat / map style
Оператор на язовири и съоръженията към тях
dam / reservoir / wall / control structure
Хидротехническо строителство и сухи СМР
pier / metal structures / concrete / dry hydrotechnical work
Водолазни курсове NAUI / CMAS
recreational scuba / training / Black Sea diving

If suitable local images do not exist, do not add fake paths.
Report missing image needs.

Acceptance
Service main image works.
Service gallery works from CMS.
No service has broken image.
No external images.
No hardcoded service media remains except safe placeholder styling.
PHASE 5 — SERVICES CUBE STABILIZATION
Current problems
Cube is confusing.
Faces appear too dark/transparent or visually hard to understand.
Service selection can feel unreliable.
Removing text made the cube hard to navigate.
Hover effect must feel like a flashlight, not full-face recolor.
Requirements

The cube must:

receive exactly 6 services
have solid opaque faces
show service name clearly
use service image as face texture/background if available
fallback to solid dark technical face if no image exists
keep copper borders/edges
not use Html from @react-three/drei if it causes pointer-events or transparency issues
Text on cube faces

If rendering text on cube faces:

use canvas texture or material texture
do not use DOM Html overlay if it causes z-index/pointer conflicts
text must be readable
add dark overlay/vignette inside texture if needed
Hover flashlight effect

Do NOT recolor the whole face uniformly.

Implement a localized effect:

radial light spot
subtle copper/white glow
fades outward
face image remains visible
feels like inspection flashlight passing over the surface

If true pointer tracking is too complex, use localized radial gradient around face center on hover.

Click mapping

Clicking must be deterministic:

face 1 opens service 1
face 2 opens service 2
no random service
no invisible overlapping face captures click

Check:

raycast order
face index mapping
event bubbling
pointer-events
duplicate services array
Acceptance
Cube is opaque.
Cube has readable service names.
Cube uses service images when available.
Hover looks like localized light, not full face recolor.
Clicking a face opens the correct service.
Cube only has 6 services.
PHASE 6 — SERVICE DETAIL OVERLAY
Current problems
X button may be blocked.
User can get trapped in service detail.
Navigation may not work while inside service detail.
Detail views are too generic.
Full overlay scroll is not wanted.
Requirements

Service detail overlay:

should not scroll as a whole
outer overlay: overflow-hidden
layout: flex flex-col h-screen

Structure:

fixed header/title area: flex-shrink-0
middle content area: flex-1 overflow-y-auto
bottom gallery/actions: flex-shrink-0

Only inner text/list area can scroll if needed.

Buttons

Move X and “Назад към услугите” away from navbar area.

Use bottom controls:

X or close button: bottom right
“Назад към услугите”: bottom left

They must:

have high z-index
have pointer-events-auto
call setActiveService(null)
work on desktop and mobile

Main navigation while service detail is open:

nav click should close activeService
then navigate to selected scene
service overlay must not trap navigation
Detail content

Each service detail should include:

title
intro
main image
gallery if available
unordered/ordered list of key activities
capability/process/technical cards
richer composition than image + paragraph

Layouts should not all feel identical.

Acceptance
X works.
Back button works.
User can return to cube.
Main nav works while service detail is open.
Overlay itself does not scroll.
Detail views have image, gallery, cards and list.
PHASE 7 — PROJECTS / NEWS FILTERS
Current problem

Filters repeat:

“Проекти”
“Новини”

because type values and category values are mixed visually.

Required filter structure

Row 1 — Type filter:

Всички
Проекти
Новини

Row 2 — Service/category filter:

only real service/category values

Exclude these from category row:

PROJECT
NEWS
Проекти
Новини
project
news

Do not invent categories.

If CMS categories are empty:

hide category row
report that Project/News category fields must be filled

If categories exist:

render them dynamically from CMS project data
filtering must recalculate pagination
Future service category values

Projects should eventually use categories like:

Индустриални водолазни услуги
ROV инспекции и роботизирано обследване
Батиметрия, хидрография и сонарни обследвания
Оператор на язовири и съоръженията към тях
Хидротехническо строителство и сухи СМР
Водолазни курсове NAUI / CMAS

But do not hardcode fake categories if CMS data does not contain them.

Acceptance
“Проекти” and “Новини” appear only once as type filters.
Category filters do not duplicate type filters.
Pagination works after filtering.
No fake categories.
PHASE 8 — PROJECTS / NEWS LAYOUT AND MODAL
Current problems
Two projects appear but do not use the full section properly.
Modal X button may not work.
Modal content is too basic.
Images may be missing.
Requirements

Section:

keep 2 projects per view/page
use full section width and height
left project and right project should feel like archive/book spread
no empty bottom half
clear prev/next navigation
“Прочети повече” visible

Project card:

title
summary
category/date if available
image if available
fallback styled placeholder if no image

Modal:

X button must work
high z-index
pointer-events-auto
outside click can remain but cannot be the only close method

Modal content:

main image
gallery if available
if no gallery: styled placeholder gallery cards
title
article/body text
unordered/ordered list with key facts/scope if data exists
previous/next project if possible

Images:

use local /uploads/bsdc/*
no external images
no unrelated images
Acceptance
Two projects fill the visual area properly.
Modal X works.
Project details are richer.
No broken images.
PHASE 9 — CONTACT SECTION REPAIR
Current problem

Contact section became messy:

company info too large / overlaps
form and contact info fight for space
map visible but layout not controlled
section does not fit cleanly
Requirements

Rebuild Contact section cleanly.

Desktop:

2-column layout
left column: company info
right column: inquiry form
Google Map visible as background
content in semi-transparent dark panels or clean readable overlay
form must fit
company title must not overlap navbar/logo

Left column:

company name
address
phones
email

Right column:

form title
name
email
phone
inquiry type
message
submit button

Inputs:

premium underline style is OK
must be readable
not too tall

Map:

visible but not destructive
dark/night navigation feel
do not cover it completely with opaque panels

Mobile:

stack columns
no horizontal overflow
Acceptance
Contact section is readable.
Form fits.
Map remains visible.
No overlap with navbar/logo.
No layout mashup.
PHASE 10 — FOOTER CLEANUP
Requirements

Footer:

logo centered in first column
logo bigger but not absurd
text readable
normal text at least text-sm
headings text-base
legal links text-sm
copyright at least text-xs, preferably text-sm
services column shows only the final 6 services
footer does not become too tall or cluttered
Acceptance
Footer readable on desktop and mobile.
Footer services not duplicated.
Legal links visible/clickable.
PHASE 11 — DO NOT RUN SEED UNTIL SAFE

Before running seed, verify:

It updates existing services only.
It does not create new service rows.
It does not blank Hero media.
It does not blank About media.
It does not overwrite CMS media with null/empty values.
It does not create duplicate Project categories.
It does not change schema.

If seed is unsafe:

fix seed first
do not run it
report exactly what would have gone wrong

If seed is safe:

say it is safe
then run only if needed
FINAL ACCEPTANCE CHECKLIST
Media
Hero image visible.
About image visible.
CMS media fields restored.
No broken images.
No external image URLs.
Services
Exactly 6 services.
Final professional names preserved.
No old/new duplicates.
Services order 0–5.
Service main images work.
Service gallery uses CMS images.
Cube receives exactly 6 services.
Cube readable and opaque.
Cube click mapping deterministic.
Service detail X/back works.
Nav works while service detail is open.
Projects / News
Type filters only: Всички / Проекти / Новини.
Category filters do not repeat Проекти/Новини.
Two-project layout uses full section.
Modal X works.
Images are local or placeholders.
Contact / Footer
Contact layout clean.
Form fits.
Map visible as dark background.
Footer readable.
Footer services show only 6 final services.
Rules
No schema changes.
No migrations.
No SEO.
No deployment.
No fake content.
No external hotlinked images.
No unsafe seed.
FINAL REPORT REQUIRED

After completing, report:

Files changed.
Whether seed was run or not.
Why Hero/About images disappeared.
Which CMS fields were restored.
Which media paths were restored.
How seed was made safe against media deletion.
How seed was made safe against duplicate services.
Final expected service count.
Final service names.
Project filter structure.
Contact layout changes.
Footer changes.
TypeScript status.
Any remaining manual CMS actions required.

### Очакван резултат
Claude първо ще стабилизира данните и media полетата, после ще оправи услугите, филтрите, контакт секцията и footer-а без да създава нови дубликати или да трие снимки.