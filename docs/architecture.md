# BSDC CMS Architecture

## Product type
Company website with custom CMS.

## Main goal
Replace broken WordPress website with a fast, maintainable, custom-built CMS.

## Core stack
- Next.js
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma
- Auth.js / NextAuth

## Main apps
The project will be built as a single Next.js application:
- Public website
- Admin dashboard
- API routes
- CMS logic

## Core CMS entities

### Page
Used for static website pages.

Fields:
- title
- slug
- excerpt
- content
- featuredImage
- seoTitle
- seoDescription
- published
- createdAt
- updatedAt

### Service
Used for company services.

Fields:
- title
- slug
- shortDescription
- content
- featuredImage
- seoTitle
- seoDescription
- published
- sortOrder
- createdAt
- updatedAt

### Post
Used for news or blog posts.

Fields:
- title
- slug
- excerpt
- content
- featuredImage
- seoTitle
- seoDescription
- published
- publishedAt
- createdAt
- updatedAt

### Media
Used for uploaded images and files.

Fields:
- filename
- url
- altText
- mimeType
- size
- createdAt

### MenuItem
Used for navigation menus.

Fields:
- label
- url
- parentId
- sortOrder
- visible

### Redirect
Used for old WordPress URLs.

Fields:
- source
- destination
- permanent

### SiteSetting
Used for global website settings.

Fields:
- key
- value

### ContactSubmission
Used for contact form submissions.

Fields:
- name
- email
- phone
- message
- createdAt
- read