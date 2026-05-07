# BSDC Frontend Direction

## Main idea

The public website must be an interactive storytelling one-page corporate website for bsdc.bg.

The goal is not to create a normal static company website, but a modern, immersive and professional experience that guides the visitor through BSDC's expertise, trust, services, projects, partners and contact options.

The website must feel innovative, technical, marine, engineering-focused and reliable.

## Website type

- One-page website
- Corporate presentation website
- Custom CMS-driven content
- Bulgarian and English content
- Modal-based detail views
- SEO-friendly URLs where needed

## Public sections

The website must contain these main sections:

1. Home
2. About
3. Services
4. Projects / News
5. Partners
6. Contact

Certificates must appear as a subsection inside About, not as a separate top-level menu item.

## Visual style

The design must be:

- modern
- minimalistic
- colorful but controlled
- 3D-inspired
- high-tech
- marine-inspired
- engineering-inspired
- clean
- premium
- professional
- trustworthy

The visual feeling should combine:

- ocean depth
- underwater engineering
- technical precision
- industrial reliability
- modern technology
- innovation
- trust

## Color direction

Preferred color direction:

- deep navy
- ocean blue
- dark blue gradients
- cyan accents
- turquoise accents
- white
- light gray
- subtle glass effects
- soft glow accents

Avoid:

- childish colors
- random bright colors
- too many colors at once
- heavy black-only design
- cluttered visual noise
- low contrast text

The site can be visually expressive, but it must still feel like a serious engineering and diving services company.

## Typography direction

Typography should be:

- clean
- modern
- readable
- professional
- slightly technical
- strong in headings
- calm in body text

Headlines may be large and bold, but body text must remain easy to read.

Avoid decorative fonts that reduce readability.

## Layout direction

The layout must be:

- mobile-first
- responsive
- spacious
- clean
- section-based
- easy to scan
- visually guided

Use:

- large hero area
- strong section headers
- cards
- modal details
- soft grids
- layered backgrounds
- whitespace
- visual hierarchy

Avoid:

- crowded layouts
- too many elements visible at once
- old corporate template look
- page-builder style blocks

## Motion direction

The frontend should be interactive and animated, but not overloaded.

Preferred motion:

- smooth scrolling
- section reveal animations
- staggered card animations
- subtle parallax
- soft hover interactions
- card depth / tilt effects
- animated counters
- modal open / close transitions
- partner logo marquee
- subtle background motion
- CTA hover effects
- form input micro-interactions

Avoid:

- excessive animations
- constant movement everywhere
- heavy WebGL in the first version
- animations that block usability
- long intro screens
- loading screens without purpose
- motion that hurts mobile performance

The correct feeling is:

Interactive, smooth and premium — not chaotic.

## Storytelling direction

The site should guide the visitor through a clear story:

1. BSDC is a specialized and reliable company.
2. BSDC works in demanding underwater, marine, port and dam environments.
3. BSDC provides advanced services such as diving work, ROV, bathymetry, hydrography, repairs and dam operations.
4. BSDC has real completed projects and field experience.
5. BSDC works with serious partners.
6. BSDC is certified and trustworthy.
7. The visitor can quickly send an inquiry.

The user journey must feel natural while scrolling.

## Section behavior

### Home

The Home section should be the strongest visual section.

It should include:

- strong headline
- short company positioning
- CTA buttons
- modern 3D-inspired visual
- marine / technical atmosphere
- subtle animated background
- scroll cue

Possible CTA buttons:

- View services
- View projects
- Send inquiry

The hero must be impressive but still fast and clear.

### About

The About section should build trust.

It should include:

- company story
- short text about BSDC
- key strengths
- certificates subsection
- possible statistics / numbers
- image or visual block

Possible statistics:

- years of experience
- completed projects
- service areas
- certified capabilities

Use animated counters only if values are available.

Certificates should be shown as clean cards or compact visual elements inside About.

### Services

Services must appear as interactive cards.

Each service card should include:

- title
- short description
- icon or image
- hover effect
- click action

Clicking a service opens a modal card with:

- full description
- image
- related details
- CTA to contact
- SEO-friendly route support if possible

The modal must be smooth, readable and mobile-friendly.

Current service examples:

- Diving Services
- Repairs and maintenance of ports, vessels and dams
- ROV Services
- Bathymetry and Hydrography
- Dam Operator
- Diving Courses

### Projects / News

Projects and news should appear as visual cards.

Each item should support:

- title
- excerpt
- featured image
- date
- type: project or news
- category
- multiple images in modal
- full content in modal

Clicking a project/news item opens a modal card.

The section should feel like proof of real work and field experience.

The layout may use:

- responsive card grid
- featured large card
- filters by type
- smooth reveal animations

Avoid a plain blog list.

### Partners

Partners appear as an automatic horizontal logo carousel.

Behavior:

- seamless horizontal movement
- continuous marquee
- pause on hover
- responsive
- clean grayscale or soft-color logo treatment
- no heavy slider plugin behavior

Each partner has:

- name
- logo
- website URL
- order
- visibility status

The partner section should communicate trust without becoming visually heavy.

### Contact

The Contact section must be clear and practical.

It should include:

- company address
- Google Maps embed
- phone numbers
- email
- contact inquiry form
- spam protection
- success / error states
- mobile-friendly layout

The contact form should include:

- name
- email
- phone
- message
- optional inquiry type

Spam protection:

- Cloudflare Turnstile is preferred.

The form should store submissions in the CMS.

## Modal behavior

Services, projects and news must open as modal cards.

Modal requirements:

- smooth open animation
- clear close button
- mobile-friendly full-screen behavior
- readable content
- image support
- keyboard accessibility
- ESC closes modal
- background overlay
- scrollable content when needed

Where possible, modal content should support shareable URLs for SEO and direct linking.

## Interaction hierarchy

Not every element should be equally animated.

Recommended hierarchy:

- Home: strongest visual and motion
- About: moderate reveal and trust-building interactions
- Services: strong card interactions and modal transitions
- Projects / News: strong card interactions and image-based storytelling
- Partners: subtle continuous motion
- Contact: clean micro-interactions

This prevents the website from feeling chaotic.

## 3D direction

The website should be 3D-inspired, not necessarily heavy real-time 3D.

Preferred for first version:

- 3D-looking abstract shapes
- layered gradients
- floating marine/technical objects
- depth shadows
- glass cards
- subtle parallax

Avoid in first version:

- complex Three.js scenes
- large 3D models
- slow WebGL effects
- effects that break on mobile

If real 3D is added later, it must be optional and performance-tested.

## Performance rules

The website must stay fast.

Rules:

- mobile-first
- lazy-load images
- optimize images
- avoid unnecessary libraries
- avoid heavy animation libraries unless needed
- avoid large 3D assets in first version
- keep Lighthouse performance high
- respect reduced motion preferences
- do not block content behind animations

## Accessibility rules

The site must remain usable.

Rules:

- readable contrast
- keyboard-accessible modals
- visible focus states
- semantic HTML
- accessible buttons and links
- alt text for images
- form labels
- reduced motion support

## CMS-driven frontend

The frontend must pull content from the custom CMS.

CMS-driven sections:

- Home content
- About content
- Services
- Projects / News
- Partners
- Certificates
- Contact settings
- Site settings

Static hardcoded content should be avoided where the CMS needs control.

## Technical frontend stack

Use:

- Next.js
- TypeScript
- Tailwind CSS
- Framer Motion
- custom lightweight components
- mobile-first responsive design

Optional later:

- Lenis for smooth scrolling
- React Three Fiber only if real 3D becomes necessary

Avoid:

- WordPress
- Elementor-like builders
- heavy UI kits
- unnecessary animation libraries
- plugin-based frontend behavior

## Design quality bar

The website should feel like a modern high-end corporate website, not a cheap template.

It should be:

- memorable
- trustworthy
- fast
- clear
- interactive
- polished
- easy to maintain

The final result should make BSDC look like a serious, modern and technically advanced company.