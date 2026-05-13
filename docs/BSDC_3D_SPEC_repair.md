TASK: Public website revision and repair pass for BSDC

CONTEXT:
This is the public one-page website for BSDC, connected to a custom CMS.
Do not rebuild from scratch.
Do not touch admin CMS logic unless needed only to render existing CMS data.
Do not change Prisma schema.
Do not create migrations.
Do not start SEO.
Do not deploy.
Do not invent fake projects, fake clients, fake certificates, or fake business claims.
Keep BG/EN routing working.
Keep all media paths local: /uploads/bsdc/*

GOAL:
Fix broken public website interactions, repair transitions, populate real service/project/news content from existing BSDC sources, and improve the premium presentation of Services and Projects/News.

==================================================
1. NAVIGATION
==================================================

Problems:
- Navigation links do not work, except the language switch.
- “Запитване” duplicates the Contact menu item.
- The CTA behavior is not clear.

Requirements:
- Fix all navigation anchors:
  - Начало
  - За нас
  - Услуги
  - Проекти / Новини
  - Контакти
- Keep language switch working.
- Change the “Запитване” button behavior:
  - Do not scroll to the same Contact section.
  - Open a contact/request modal instead.
  - The modal should contain a compact inquiry form.
  - The modal should feel premium, not like a default browser popup.
- Do not duplicate the same action between “Контакти” and “Запитване”:
  - “Контакти” scrolls to the Contact section.
  - “Запитване” opens the inquiry modal.

Expected result:
All nav links work, language switch works, and the CTA has a separate useful behavior.

==================================================
2. HERO SECTION
==================================================

Problems:
- The two hero buttons are not clickable.
- Button links/actions do not work.

Requirements:
- Fix both hero CTA buttons.
- Primary button should scroll/open the relevant inquiry/contact action.
- Secondary button should scroll to Services or Projects depending on current label.
- Make sure buttons work on desktop and mobile.
- Do not leave decorative buttons without functionality.

Expected result:
Hero CTAs are clickable and perform clear actions.

==================================================
3. ABOUT SECTION / TRANSITIONS
==================================================

Problem:
- During the transition from Hero to About, the About section loads, then performs a strange second transition/flicker.
- Similar bad transition behavior appears across the page: section appears, disappears/fades out, then appears again.

Requirements:
- Audit all scroll reveal / animation logic.
- Remove double-triggered animations.
- Fix flicker caused by hydration, initial opacity, repeated IntersectionObserver triggers, or conflicting Framer Motion/CSS animations.
- Sections should reveal once, smoothly.
- No section should load visibly, disappear, then animate again.
- Keep transitions premium, but stable and restrained.

Expected result:
Clean section transitions with no flicker, no double-load, and no “appears/disappears/appears” behavior.

==================================================
4. SERVICES SECTION
==================================================

Problems:
- No service link works.
- Services are not properly displayed.
- Current service presentation does not feel finished.
- Cube has wrong positioning/visual behavior.
- Cube faces are transparent.
- Cube cannot be manually rotated by holding left mouse button.
- Service content needs to be populated from real BSDC service pages.

Source URLs:
- https://www.bsdc.bg/service/
- https://www.bsdc.bg/service/diving-services/
- https://www.bsdc.bg/service/repair-and-maintance/
- https://www.bsdc.bg/service/rov-services/
- https://www.bsdc.bg/service/bathy-hidro/
- https://www.bsdc.bg/service/dam-operator/
- https://www.bsdc.bg/service/diving-courses/

Requirements:
- Fix all service links/interactions.
- Services must render on screen correctly from CMS data.
- Keep exactly 6 services.
- Rebuild the Services presentation if needed, but do not change schema.
- Cube should be shown in an isometric/3D angle.
- Cube should not have one full flat face sitting directly on the ground/screen.
- Cube faces must not be transparent.
- Cube must support mouse drag rotation:
  - hold left mouse button
  - drag to rotate
  - release to stop manual control
- Use the BSDC company logo as icon inspiration/visual identity for service icons.
- Do not use generic stock icons if the company logo can be adapted.
- Keep the section premium and technical, not playful.

FINAL SERVICES STRUCTURE:

1. Индустриални водолазни услуги

Description:
Подводни СМР, инспекции, ремонти, монтажи, демонтажи, почистване, рязане, заваряване и аварийни дейности за пристанища, язовири, ВЕЦ, тръбопроводи, плавателни съдове и хидротехнически съоръжения.

Includes:
- водолазни инспекции
- подводна техническа диагностика
- подводни ремонти
- подводни монтажи и демонтажи
- подводно рязане, къртене, пробиване и заваряване
- почистване на решетки, корпуси, винтове, изпускатели и съоръжения
- аварийни водолазни дейности
- видео и фотодокументиране

2. ROV инспекции и роботизирано обследване

Description:
Дистанционно управляеми подводни инспекции с ROV за тръби, тунели, язовири, ВЕЦ, резервоари, мостове, кейове и рискови или труднодостъпни зони.

Includes:
- ROV огледи
- инспекции в тръби и затворени пространства
- сонар, камера, осветление и роботизирана ръка
- локализиране на обекти
- видео документиране
- работа при условия, неподходящи за водолазен достъп

3. Батиметрия, хидрография и сонарни обследвания

Description:
Измерване, сканиране и документиране на дъно, водни площи, язовири, пристанища, подходи, наноси и подводна инфраструктура.

Includes:
- батиметрични измервания
- сонарно сканиране
- дънни профили
- локализиране на подводни обекти
- данни за проектиране, ремонт, почистване и технически анализ

4. Оператор на язовири и съоръженията към тях

Description:
Техническа експлоатация, контрол, документация и поддръжка на язовирни стени и съоръженията към тях съгласно изискванията на Закона за водите.

Includes:
- оператор на язовир
- контрол на язовирни стени
- КИС измервания
- обработка на данни от контролно-измервателни системи
- индивидуална оценка на техническото състояние
- програма за технически контрол
- аварийни планове
- доклади и документация

Important:
Keep the phrase “Оператор на язовири” visible.
Do not rename this service into a generic infrastructure title.

5. Хидротехническо строителство и сухи СМР

Description:
Строително-монтажни и ремонтни дейности по хидротехническа, пристанищна и язовирна инфраструктура, изпълнявани над вода, на сухо или при осушени/достъпни участъци.

Includes:
- ремонт на кейове, пирсове, пасарелки и площадки
- монтаж и ремонт на метални конструкции
- подмяна на решетки, стълби, парапети и сервизни елементи
- бетонови възстановявания
- антикорозионна защита
- работа по водовземни кули, шахти, камери и сервизни зони
- подготовка на участъци за последващи водолазни или ROV дейности

Important:
This is a separate dry-side service.
It is not underwater diving.
It represents BSDC’s technical capability around hydrotechnical sites.

6. Водолазни курсове NAUI / CMAS

Description:
Любителско водолазно обучение, пробни гмуркания и сертификационни курсове по системите NAUI и CMAS.

Includes:
- пробно гмуркане
- Scuba Diver
- Passport Scuba Diver
- Master Scuba Diver
- NAUI и CMAS обучение
- индивидуални и групови гмуркания
- гмуркания във Варна и по българското Черноморие

Important:
Do not call NAUI/CMAS courses professional commercial diving training.
Use “любителско”, “сертификационно”, “NAUI”, “CMAS”, “scuba”.

Expected result:
Services become functional, visually stronger, technically accurate, and not repetitive.

==================================================
5. PROJECTS / NEWS SECTION
==================================================

Problems:
- Only 6 projects/news items load.
- There is no scroll or pagination to access the rest.
- Items do not open properly.
- The section does not look like an old diary/book.
- There is no “Прочети повече”.
- Modal/detail layouts are too basic.
- There are no rich galleries inside details.
- Filtering/category browsing is missing.

Source URLs:
- https://www.bsdc.bg/news/нова-локация-на-производствена-и-офис/
- https://www.bsdc.bg/news/оглед-и-оценка-на-състоянието-на-гнд-з/
- https://www.bsdc.bg/news/ремонтно-възстановителни-и-укрепит/
- https://www.bsdc.bg/news/подводен-оглед-на-основен-изпускате/
- https://www.bsdc.bg/news/подводен-оглед-на-основен-изпускате-2/
- https://www.bsdc.bg/news/подводен-оглед-на-ои-на-язовир-алекс/
- https://www.bsdc.bg/news/ремонт-на-свод-на-входна-шахта-на-дес/
- https://www.bsdc.bg/news/вец-луковит-проектиране-достав/
- https://www.bsdc.bg/news/подводен-оглед-на-водовземна-кула-за/
- https://www.bsdc.bg/news/подводен-оглед-на-съоръжения-яз-сту/
- https://www.bsdc.bg/news/разхлабването-на-болтовите-връзки-на/
- https://www.bsdc.bg/news/подводен-оглед-на-ои-на-язовир-тешал/
- https://www.bsdc.bg/news/подводен-оглед-на-ои-на-язовирна-стена/
- https://www.bsdc.bg/news/ясна-поляна/
- https://www.bsdc.bg/news/подводен-оглед-на-решетка-на-основен-и/

Requirements:
- Import/populate all available project/news content from the listed BSDC links into the existing CMS structure.
- Do not invent missing text.
- If a page has limited content, use only factual summarization from the source.
- Do not use external media.
- Use local media paths only: /uploads/bsdc/*
- The Projects/News section should look like an old technical diary / archive book.
- Show two items per “page” if suitable.
- Add 3D page-turn / book-style navigation for moving through items.
- Add a contents/index page or contents-style navigation.
- Add category filters.
- Add “Прочети повече” for every item.
- Detail/modal view should be rich:
  - title
  - date/category if available
  - full text
  - image/gallery if available
  - previous/next item navigation
- Make sure all items are reachable, not only the first 6.
- Keep performance acceptable on mobile.

Expected result:
Projects/News becomes a premium archive/book-style section with all real BSDC items accessible.

==================================================
6. CONTACT SECTION
==================================================

Problems:
- No Google Maps embed.
- It is unclear if there is anti-spam protection.

Requirements:
- Add Google Maps only if the correct company location/address is already available in CMS/settings.
- If exact address is not available, do not invent one.
- Check the contact form for anti-spam protection.
- Add basic anti-spam protection if missing:
  - honeypot field
  - minimum submit delay
  - server-side validation
  - rate limiting if already supported by the current stack
- Do not add intrusive captcha unless necessary.
- Contact form must work in BG/EN.
- Inquiry modal and Contact section can reuse the same backend submission logic.

Expected result:
Contact section is functional, safer against spam, and does not contain fake location data.

==================================================
7. FOOTER / LEGAL
==================================================

Required footer links:
- Privacy Policy / Политика за поверителност
- Cookie Policy / Политика за бисквитки
- Terms of Use / Условия за ползване
- Contact / Контакти

Recommended footer content:
Company:
Черноморски Водолазен Център ООД

Contact details:
- phone
- email
- city / country
- contact form link

Navigation anchors:
- Начало
- За нас
- Услуги
- Проекти
- Контакти

Legal links:
- Политика за поверителност
- Политика за бисквитки
- Условия за ползване

Copyright:
© Черноморски Водолазен Център ООД. Всички права запазени.

Footer structure:
Column 1 — Brand / short company description
Column 2 — Navigation
Column 3 — Services
Column 4 — Contact + Legal links

Cookie banner rules:
- Add cookie banner only if the website uses:
  - Google Analytics
  - Meta Pixel
  - tracking cookies
  - marketing cookies
  - embedded third-party services that set cookies
- If the website uses only strictly necessary cookies, do not add a large accept/reject banner.
- Cookie Policy should still explain what is used.

Do not add:
- newsletter subscription
- full FAQ in footer
- SEO features
- sitemap
- robots.txt
- structured data
- canonical URLs
- meta tag cleanup

Expected result:
Footer becomes clean, legal-ready, and premium without unnecessary GDPR burden.

==================================================
8. GLOBAL TRANSITION / ANIMATION FIX
==================================================

Problem:
Across the public site, transitions are not good.
Sections appear, then disappear, then appear again.
This happens on multiple sections/pages.

Requirements:
- Audit all animations globally.
- Fix hydration/initial render flicker.
- Fix repeated scroll reveal triggers.
- Avoid conflicting CSS and Framer Motion animations.
- Use stable initial states.
- Animate once where appropriate.
- Disable heavy animations on mobile if they cause jank.
- Respect reduced-motion preference.
- Keep the visual style premium, but not unstable.

Expected result:
The whole public site feels stable, smooth and intentional.

==================================================
FINAL ACCEPTANCE CHECKLIST
==================================================

Before finishing, verify:

- Nav links work.
- Language switch works.
- “Запитване” opens modal.
- Hero buttons work.
- About transition does not flicker.
- Services render correctly.
- Service links/interactions work.
- Cube is opaque.
- Cube starts in an isometric angle.
- Cube rotates with left mouse drag.
- Exactly 6 services are shown.
- Service content matches the approved structure.
- Projects/News loads all imported items, not only 6.
- Projects/News items open.
- “Прочети повече” exists.
- Book/diary style interaction works.
- Category filters work.
- Contact form works.
- Anti-spam protection exists or is added.
- Footer has required legal links.
- No SEO work is started.
- No schema changes are made.
- No migrations are created.
- No fake content is added.