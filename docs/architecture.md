# BSDC CMS Specification v1

## Project goal

Rebuild bsdc.bg as a modern custom CMS and one-page corporate website.

The new website will replace the current WordPress + Elementor + plugin-based setup.

## Current website observations

The current WordPress website uses:
- Elementor
- Astra
- Polylang
- All in One SEO
- Logo Slider
- WPForms
- W3 Total Cache
- WP Super Minify
- ElementsKit
- Royal Elementor Addons

The website contains:
- Bulgarian and English content
- Static company pages
- Service pages
- News/project posts
- Partner logos
- Media library with many images

## Public website structure

The public website must be a one-page website with the following sections:

1. Home
2. About
3. Services
4. Projects / News
5. Partners
6. Contact

The site must support Bulgarian and English content.

## Design direction

The visual style must be:
- modern
- minimalistic
- colorful
- 3D-inspired
- clean
- professional
- animated but not heavy

Use:
- smooth section transitions
- subtle 3D shapes
- soft gradients
- glass-style cards
- clean typography
- responsive mobile-first layout

## Content behavior

### Services

Services appear as cards in the Services section.

Clicking a service opens a modal card.

Each service must also have a shareable URL for SEO and direct linking.

Current service examples:
- Diving Services
- Repairs and maintenance of ports, vessels and dams
- ROV Services
- Bathymetry and Hydrography
- Dam operator
- Diving Courses

### Projects / News

Projects and news appear as cards.

Clicking an item opens a modal card.

Each project/news item must support:
- title
- short description
- full content
- main image
- multiple images
- date
- category
- SEO metadata
- Bulgarian and English content

### Partners

Partners appear as an automatically moving horizontal logo carousel.

Each partner has:
- name
- logo
- website URL
- order
- visibility status

### Certificates

Certificates are not a top-level menu section.

They appear inside the About section.

Each certificate has:
- title
- issuer
- date
- image or PDF
- short description
- order
- visibility status

### Contact

The Contact section contains:
- company address
- Google Maps embed
- phone numbers
- email
- contact inquiry form
- spam protection
- saved contact submissions in CMS

Preferred spam protection:
- Cloudflare Turnstile

## CMS modules

The admin dashboard must include:

1. Dashboard
2. Home Section
3. About Section
4. Services
5. Projects / News
6. Partners
7. Certificates
8. Media
9. Contact Submissions
10. Site Settings

## CMS content models

### SiteSetting

Stores global website settings:
- company name
- logo
- address
- phones
- email
- working hours
- Google Maps embed
- social links
- footer text
- default SEO title
- default SEO description

### HomeContent

Stores homepage hero content:
- language
- headline
- subheadline
- CTA label
- CTA target
- hero image / visual

### AboutContent

Stores About section content:
- language
- title
- subtitle
- content
- image
- statistics

### Service

Stores service cards and service details:
- language
- title
- slug
- shortDescription
- content
- icon
- featuredImage
- seoTitle
- seoDescription
- sortOrder
- published

### ProjectNewsItem

Stores both projects and news:
- language
- type: project or news
- title
- slug
- excerpt
- content
- featuredImage
- images
- category
- publishedAt
- seoTitle
- seoDescription
- sortOrder
- published

### Partner

Stores partner logos:
- name
- logo
- websiteUrl
- sortOrder
- published

### Certificate

Stores certificates:
- language
- title
- issuer
- issueDate
- fileUrl
- imageUrl
- description
- sortOrder
- published

### Media

Stores uploaded files:
- filename
- url
- altText
- mimeType
- size
- createdAt

### ContactSubmission

Stores contact form submissions:
- name
- email
- phone
- message
- source
- createdAt
- read

## Technical stack

Use:
- Next.js
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma
- Auth.js / NextAuth
- Supabase database
- Cloudflare Turnstile for spam protection

## Deployment direction

Recommended:
- Vercel for the Next.js website
- Supabase for PostgreSQL
- SuperHosting for domain, email, and old WordPress archive

## Important rules

- Do not use WordPress
- Do not use plugin-based CMS systems
- Do not build a generic CMS
- Build a specialized CMS for BSDC
- Keep dependencies minimal
- Keep the UI fast
- Keep the admin simple
- Preserve SEO from the old website where possible
- Preserve Bulgarian and English content