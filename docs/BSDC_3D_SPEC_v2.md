# BSDC — Пълна техническа спецификация за 3D Experience v2

## Контекст
Next.js 16 App Router + React 19 + Tailwind CSS v4 + Prisma + PostgreSQL
Инсталирани: gsap@3.15.0, three@0.184.0, @react-three/fiber@9.6.1, @react-three/drei@10.7.7
Главният файл: src/components/PageExperience.tsx ('use client')
CMS данните идват като props: home, about, services, projects, certificates, partners, settings, lang

---

## КРИТИЧНО — Правила за преходи между сцени

ВСИЧКИ преходи между сцени трябва да са cross-dissolve (blend).
Двете сцени се виждат ЕДНОВРЕМЕННО по време на прехода.
НИКОГА няма черен екран между сцените.

Правилото:
- t=0.0s: Текуща сцена opacity:1, Следваща сцена opacity:0
- t=0.7s: Текуща сцена opacity:0.5, Следваща сцена opacity:0.5 (двете видими едновременно)
- t=1.4s: Текуща сцена opacity:0, Следваща сцена opacity:1
- Duration: 1.4s минимум
- Ease: "power2.inOut" за плавно смесване

GSAP implementation:
const tl = gsap.timeline({ onComplete: () => { isAnimating.current = false } })
tl.to(currentEl, { opacity: 0, duration: 1.4, ease: "power2.inOut" }, 0)
tl.fromTo(nextEl, { opacity: 0 }, { opacity: 1, duration: 1.4, ease: "power2.inOut" }, 0)

Изключение: Hero→About прехода има допълнителни елементни анимации
но основният cross-dissolve остава същият.

---

## Архитектура

Целият сайт е един fixed div (100vw x 100vh, overflow hidden).
Скролът е hijacked — wheel/touch/keyboard сменят сцените.
Всяка сцена е absolute inset-0.
GSAP управлява всички преходи.
Three.js Canvas е глобален фон зад всички сцени.
Debounce между преходи: 1600ms (isAnimating ref).

---

## Глобален 3D фон

Създай src/components/3d/GlobalBackground.tsx ('use client'):
- React Three Fiber Canvas, fixed, inset-0, z-index:-1, pointer-events-none
- Съдържа частици (Points) — 2000 точки, случайно разпределени в сфера r=50
- Частиците бавно се въртят (0.0005 rad/frame на Y ос)
- Цвят: #1a3a4a (тъмно синьо-зелено)
- Размер: 0.08
- На мишка: групата се накланя леко следвайки cursor (max ±5°, lerp 0.02)
- Между сцените: частиците ускоряват (scale velocity x5) за 0.8s после забавят

Добави GlobalBackground в PageExperience.tsx като първи child в root div.

---

## Сцена 0 — HERO

### Визия
Тъмен екран. Частиците са фон. Снимката на водолаза вляво/центъра.
Текстът влиза дума по дума отдолу нагоре.

### Layout
- Фонова снимка: home?.heroImageUrl, fill, object-cover
  Ken Burns: scale 1.0→1.08 за 14s, ease-in-out, alternate infinite
- Gradient overlay bottom: from-[#020617] via-[#020617]/50 to-transparent
- Gradient overlay left: from-[#020617]/80 to-transparent
- Съдържание: absolute inset-0 z-10, flex flex-col justify-center px-16 pt-20

### Елементи
- Eyebrow: home?.eyebrow, copper (#B87333), text-[11px] tracking-[0.35em] uppercase
- Headline: home?.headline, split по думи, всяка дума е block span (className="hero-word")
  text-7xl md:text-8xl font-black leading-[0.85]
- Subheadline: home?.subheadline, text-slate-400, text-base, max-w-sm
- CTA primary: home?.ctaLabel → onClick={() => goToScene(2)}, bg-[#B87333]
- CTA secondary: home?.ctaSecondaryLabel → onClick={() => goToScene(1)}
- Stats strip: absolute bottom-0, 3 колони от allStats.slice(0,3)
  Анимирано броене при зареждане (GSAP counter от 0 до стойността)
- Scroll indicator: bottom-24 right-8, vertical "SCROLL" text + copper line animate-pulse

### GSAP Entrance (delay 0.5s, scoped to heroRef via gsap.context)
Timeline:
- .hero-eyebrow: from y:30 opacity:0, duration:0.8
- .hero-word: from y:80 opacity:0, stagger:0.12, duration:0.9
- .hero-sub: from y:20 opacity:0, duration:0.7
- .hero-cta: from y:20 opacity:0, duration:0.6
- .hero-stats: from y:30 opacity:0, duration:0.7
Ease: "power3.out" за всички

### Допълнителен Hero→About преход (върху стандартния cross-dissolve)
Докато cross-dissolve върви (1.4s):
- t=0.0: .hero-word scatter — x:random(±500), y:random(±400), rotation:random(±180)
  opacity→0, duration:0.5, stagger:0.04, ease:"power2.in"
- t=0.0: .hero-eyebrow x→-300 opacity→0, duration:0.4
- t=0.3: ripple overlay div в body, radial-gradient от center
  scale 0→4, opacity 0.6→0, duration:0.9, remove on complete

---

## Сцена 1 — ABOUT

### Визия
Тъмен фон #07111f. Две колони горе. Сертификати долу.

### Layout (100vh, flex column, NO overflow)

TOP (flex-1, flex row):
  LEFT (w-1/2, bg-[#07111f], px-16, flex col justify-center):
    - Copper eyebrow (className="about-eyebrow"):
      flex items-center gap-3, copper line w-6 h-px + text-[11px] tracking-[0.3em] uppercase text-[#B87333]
      text: about?.subtitle ?? "ВИСОКОКАЧЕСТВЕНИ РЕШЕНИЯ"
    - H2 (className="about-title"):
      text-6xl font-black text-white leading-tight mb-6
      text: about?.title ?? "За нас"
    - Body (className="about-text"):
      dangerouslySetInnerHTML={{ __html: about?.content ?? "" }}
      text-slate-400 text-sm leading-relaxed max-w-sm mb-8
    - Stats (className="about-stats", flex gap-10):
      aboutStats = allStats.slice(3,6)
      value: text-3xl font-black text-[#B87333], data-stat-value={stat.value}
      label: text-[10px] uppercase tracking-[0.2em] text-slate-500 mt-1

  RIGHT (w-1/2, relative overflow-hidden, className="about-image"):
    - img: src={about?.imageUrl ?? about?.sectionImageUrl ?? ""}
      absolute inset-0 w-full h-full object-cover object-center
    - gradient overlay: absolute inset-0
      bg-gradient-to-r from-[#07111f] via-[#07111f]/20 to-transparent

BOTTOM (border-t border-white/[0.06], bg-[#020617]/95, py-6 px-16):
    - "Сертификати" label (className="about-certs"):
      text-xl font-bold text-white mb-4
    - flex flex-wrap justify-center gap-3:
      Всяка карта: w-44, border border-white/[0.08], p-3
      hover:border-[#B87333]/40 transition-colors
      title: text-xs font-semibold text-white leading-tight mb-1
      issuer: text-[10px] text-[#B87333] uppercase tracking-wide mb-1
      date: text-[10px] text-slate-500

### GSAP Entrance (trigger при влизане, delay 0.4s след transition start)
- .about-eyebrow: x:-40→0, opacity:0→1, duration:0.7
- .about-title: x:-60→0, opacity:0→1, duration:0.8, delay:0.1
- .about-text: y:30→0, opacity:0→1, duration:0.7, delay:0.2
- .about-image: x:80→0, opacity:0→1, duration:0.9, delay:0.1
- .about-stats: y:30→0, opacity:0→1, duration:0.6, delay:0.3
- .about-certs: y:40→0, opacity:0→1, duration:0.6, delay:0.4

---

## Сцена 2 — SERVICES

### Визия
Тъмен екран. Spotlight в центъра. Интерактивен 3D куб.
Всяка страна = една услуга от CMS (до 6 услуги).

### Layout
- Фон: #020617
- Центриран 3D куб (React Three Fiber компонент)
- Ляво вертикално меню с имена на услуги
- Service detail overlay при клик

### 3D Куб — src/components/3d/ServicesCube.tsx

Props: services: Service[]

Геометрия: BoxGeometry(3, 3, 3)
6 страни, всяка съответства на services[i]

Materials: MeshStandardMaterial за всяка страна
- Default: color #0a1628, opacity 0.9
- Hovered: color #0d1f3c, emissive #B87333, emissiveIntensity 0.1
- Active: color #0d1f3c, emissive #B87333, emissiveIntensity 0.3

Lights:
- ambientLight intensity:0.3
- spotLight position:(0,5,5) intensity:2 color:#ffffff penumbra:0.5
- pointLight position:(-3,2,0) intensity:0.8 color:#B87333

Controls: OrbitControls
- enableZoom:false, enablePan:false
- autoRotate:true, autoRotateSpeed:0.5
- autoRotate спира при hover

Mouse hover на страна:
- Детектирай с raycaster
- Страната се мести напред (z offset +0.15)
- cursor: crosshair

Клик на страна:
- setActiveService(services[faceIndex])
- Camera анимира z: current→3, duration:0.6
- Detail overlay се показва

HTML overlay върху всяка страна (CSS 3D transform):
- Service icon name (Lucide icon)
- Service title (text-xs)
- Ползвай Html компонент от @react-three/drei

Auto-showcase: ако няма interaction за 6s → autoRotate:true

Detail overlay (fullscreen, z-50):
- Тъмен фон bg-[#020617]/95 backdrop-blur
- Голяма снимка: service.featuredImageUrl (ако няма → gradient placeholder)
- Заглавие: text-4xl font-black text-white
- Content: dangerouslySetInnerHTML rich text, text-slate-400
- Затваряне: X бутон горе дясно + Escape key → closeDetail()
- closeDetail(): overlay изчезва, camera zoom back z→8

### Ляво меню (в PageExperience, не в куба)
Fixed ляво в services сцената, вертикален списък:
- "УСЛУГИ" copper label, text-[10px] tracking-[0.3em] uppercase mb-6
- За всяка услуга: button, text-[11px] uppercase tracking-[0.15em]
- Активна: text-white + w-4 h-px bg-[#B87333] вляво (bullet line)
- Неактивна: text-slate-500 hover:text-slate-300
- Клик → cubeRef.current?.rotateTo(faceIndex)

### Entrance transition
При влизане в сцена 2:
- t=0.0: cross-dissolve започва (стандартен)
- t=0.4: spotlight появява се (CSS radial gradient, opacity 0→1, duration:0.6)
- t=0.5: куб materializes:
  Първо wireframe (EdgesGeometry, copper color, opacity 0→1, duration:0.4)
  После solid faces (opacity 0→0.9, duration:0.6)
  Scale: 0.3→1, ease:"elastic.out(1,0.5)", duration:1.0
- t=0.8: меню slides in от ляво (x:-100→0, opacity 0→1, duration:0.6)

---

## Сцена 3 — PROJECTS (Стар дневник)

### Визия
Старинен дневник/журнал. Тъмна хартия. Медни акценти.
Проектите изглеждат като ръкописни записи.

### Цветова палитра за тази сцена
- Фон: #0f0a05 (много тъмен sepia)
- Хартия: #1a1208
- Стар текст: #8B7355
- Copper ink: #B87333
- Снимки: sepia filter + grain overlay

### CSS за journal ефект (добави в globals.css)
@keyframes grain {
  0%, 100% { transform: translate(0, 0) }
  10% { transform: translate(-2%, -3%) }
  20% { transform: translate(3%, 2%) }
  30% { transform: translate(-1%, 4%) }
  40% { transform: translate(2%, -1%) }
  50% { transform: translate(-3%, 3%) }
  60% { transform: translate(1%, -2%) }
  70% { transform: translate(-2%, 1%) }
  80% { transform: translate(3%, -3%) }
  90% { transform: translate(-1%, 2%) }
}
.journal-grain::after {
  content: '';
  position: absolute;
  inset: -50%;
  width: 200%;
  height: 200%;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E");
  animation: grain 0.5s steps(1) infinite;
  opacity: 0.15;
  pointer-events: none;
}

### Layout
Header (px-16 pt-20 pb-8):
  - Copper decorative line: w-12 h-px bg-[#B87333] mb-4
  - Label: "ДНЕВНИК НА МИСИИТЕ" text-[10px] tracking-[0.4em] uppercase color:#8B7355
  - Заглавие: text-5xl font-black color:#c4a882 (old paper color)
  - Декоративна хоризонтална линия: border-b border-[#B87333]/30 pb-4

Grid (px-16, grid grid-cols-3 gap-6):
  6 карти на страница

### Journal entry карта
- Фон: #1a1208
- Border: 1px solid rgba(139,115,85,0.3)
- Torn edge горе: CSS clip-path polygon с неравни ъгли
  clip-path: polygon(0 3%, 2% 0, 5% 2%, 8% 0, 12% 3%, 100% 0, 100% 100%, 0 100%)
- Снимка: aspect-video, filter: sepia(0.4) contrast(1.1) brightness(0.85)
  Grain overlay върху снимката (pseudo-element)
- Тип badge: rubber stamp ефект
  border: 2px solid #B87333, color #B87333
  font-family: monospace, letter-spacing: 0.2em
  transform: rotate(-2deg), opacity: 0.8
- Дата: font-family: 'Courier New' monospace, color:#8B7355, text-xs
- Заглавие: color:#c4a882, font-weight:600, text-sm leading-tight
- Excerpt: color:#6b5a45, text-xs leading-relaxed, line-clamp-3
- "Прочети" link: color:#B87333, text-[10px] tracking-[0.2em] uppercase
  hover: opacity увеличава се

Hover ефект:
- Картата се повдига: translateY(-4px)
- Border color: rgba(184,115,51,0.6)
- Снимката: sepia намалява (sepia(0.1))
- Transition: all 0.3s ease

### Навигация между страници (Page flip)
- Долу центъра: номера на страниците като кръгчета
- Активна страница: copper fill
- Клик за следваща страница:
  Текущите 6 карти: translateX(-100%) + rotateY(-15deg), opacity→0, duration:0.5
  Следващите 6: идват от дясно translateX(100%)→0 + rotateY(0), duration:0.5
- "← →" Navigation бутони вдясно долу

### Entrance transition
- cross-dissolve (стандартен 1.4s)
- При влизане: картите изплуват от долу
  y:60→0, opacity:0→1, stagger:0.08, duration:0.6, delay:0.4

---

## Сцена 4 — CONTACT + PARTNERS + FOOTER

### Визия
Изплува от тъмнината. Ripple ефект при влизане.
Без Google Maps.

### Entrance transition
- cross-dissolve (стандартен 1.4s)
- t=0.3: ripple CSS animation — 3 концентрични кръга от центъра
  scale 0→3, opacity 0.4→0, delays: 0s, 0.2s, 0.4s

### Layout (flex column, 100vh)

TOP (flex-1, flex row):

  LEFT (w-1/2, px-16, flex col justify-center, bg-[#020617]):
    - "КОНТАКТИ" copper label, text-[10px] tracking-[0.3em] uppercase mb-6
    - Заглавие: settings?.companyName, text-3xl font-black text-white mb-8
    - Контактна информация (typewriter стил):
      font-family: 'Courier New' monospace
      Всеки ред: flex items-start gap-3
      Lucide икона (copper, w-4 h-4 mt-0.5) + текст text-sm text-slate-400
      
      Редове:
      - MapPin icon + settings?.address
      - Phone icon + settings?.phone1 (ако има)
      - Phone icon + settings?.phone2 (ако има)
      - Phone icon + settings?.phone3 (ако има)
      - Mail icon + settings?.email
    
    - Работно време (ако settings?.workingHours):
      Clock icon + settings?.workingHours

  RIGHT (w-1/2, px-16, flex col justify-center, bg-[#07111f]):
    - Контактна форма:
      Заглавие: "Изпратете запитване", text-xl font-bold text-white mb-6
      
      Полета (dark inputs: bg-white/[0.04], border border-white/[0.08]):
      - Ime: text input, placeholder "Вашето име"
      - Email: email input, placeholder "email@example.com"
      - Телефон: tel input, placeholder "+359..."
      - Вид запитване: select с options
      - Съобщение: textarea rows:4
      
      Anti-spam:
      - Honeypot: hidden input name="website" (ако е попълнен → не изпращай)
      - Rate limiting: localStorage timestamp check (max 1 submit per 60s)
      
      Submit бутон: bg-[#B87333] hover:bg-[#a0622b] text-white
        text-[11px] tracking-[0.2em] uppercase px-8 py-4 w-full
        loading state: spinner + "Изпращане..."
      
      Success state: 
        Зелена checkmark анимация (SVG stroke animation)
        "Благодарим! Ще се свържем с вас скоро."
        text-emerald-400
      
      Error state: text-red-400 "Грешка. Моля опитайте отново."
      
      POST към /api/contact с body: { name, email, phone, type, message }

MIDDLE (partners ticker, border-t border-white/[0.06]):
  - Безкраен CSS ticker (animate-bsdc-ticker)
  - Всички partner лога: filter brightness-0 invert (бели)
  - Hover на лого: filter sepia(1) saturate(5) hue-rotate(5deg) (copper tint)
  - Padding: py-8

BOTTOM (footer, border-t border-[#B87333]/30):
  - bg-[#020617]
  - 3 колони (grid grid-cols-3 gap-8 px-16 py-10):
    
    Колона 1: Бранд
      - Лого img: /uploads/bsdc/logo-white-cropped.png, h-10 w-auto
      - Слоган: settings?.footerText, text-slate-500 text-xs mt-3 max-w-xs
    
    Колона 2: Навигация
      - "Навигация" label, text-[10px] tracking-[0.3em] uppercase text-[#B87333] mb-4
      - Links: За нас / Услуги / Проекти / Партньори / Контакти
        text-slate-400 text-xs hover:text-white transition-colors
        onClick → goToScene(index)
    
    Колона 3: Контакти
      - "Контакти" label, text-[10px] tracking-[0.3em] uppercase text-[#B87333] mb-4
      - settings?.address, phone1, email
        text-slate-400 text-xs, line-height: relaxed
  
  - Copyright bar (border-t border-white/[0.05] mt-6 pt-6):
    text-center text-[10px] text-slate-600
    "© 2026 {settings?.companyName}. Всички права запазени."
    + lang switcher: BG / EN вдясно

---

## Глобална навигация

### Десни navigation dots
Fixed right-6, top-1/2 transform -translate-y-1/2, z-50
flex flex-col items-center gap-3

За всяка сцена: button onClick={() => goToScene(i)}
Активна: div w-2 h-6 bg-[#B87333] rounded-full, transition-all duration-300
Неактивна: div w-2 h-2 bg-white/20 rounded-full hover:bg-white/40

Tooltip: при hover показва label вляво от dot
  absolute right-full mr-3, text-[10px] text-white/60 whitespace-nowrap

### Scene counter (долу ляво)
Fixed bottom-8 left-8, z-50
"{currentScene+1 padStart 2, '0'}" text-lg font-black text-white
" / " text-xs text-white/20
"{totalScenes padStart 2, '0'}" text-xs text-white/30

### Navbar behavior
При сцена 0 (Hero): прозрачен фон
При всички останали: bg-[#020617]/95 backdrop-blur-md border-b border-white/[0.06]
Transition: GSAP opacity при смяна на сцена

Nav links onClick:
- "За нас" → goToScene(1)
- "Услуги" → goToScene(2)
- "Проекти" → goToScene(3)
- "Контакти" → goToScene(4)

### Keyboard navigation
window.addEventListener("keydown"):
- ArrowDown → goToScene(current + 1)
- ArrowUp → goToScene(current - 1)
- Escape → затваря service detail overlay

### Touch/Mobile
touchstart: записва touchStartY
touchend: ако delta > 50px → goToScene(current + 1)
          ако delta < -50px → goToScene(current - 1)

---

## goToScene функция — пълна имплементация

```typescript
function goToScene(next: number) {
  const current = currentSceneRef.current
  if (isAnimating.current) return
  if (next < 0 || next >= totalScenes) return
  if (next === current) return

  isAnimating.current = true

  const currentEl = sceneRefs[current].current
  const nextEl = sceneRefs[next].current

  // Reset next scene position
  if (nextEl) gsap.set(nextEl, { opacity: 0 })

  const tl = gsap.timeline({
    onComplete: () => {
      currentSceneRef.current = next
      setCurrentScene(next)
      isAnimating.current = false
      // Trigger entrance animations for the new scene
      triggerSceneEntrance(next)
    }
  })

  // CROSS-DISSOLVE — двете сцени едновременно
  if (currentEl) tl.to(currentEl, { opacity: 0, duration: 1.4, ease: "power2.inOut" }, 0)
  if (nextEl) tl.to(nextEl, { opacity: 1, duration: 1.4, ease: "power2.inOut" }, 0)

  // Hero exit special effects (само при Hero→About)
  if (current === 0 && next === 1) {
    const words = heroRef.current?.querySelectorAll('.hero-word')
    words?.forEach((word) => {
      tl.to(word, {
        x: (Math.random() - 0.5) * 1000,
        y: (Math.random() - 0.5) * 800,
        rotation: (Math.random() - 0.5) * 360,
        opacity: 0,
        duration: 0.5,
        ease: "power2.in"
      }, 0)
    })
  }
}

function triggerSceneEntrance(sceneIndex: number) {
  const delay = 0.3 // след cross-dissolve старта
  
  if (sceneIndex === 1) {
    // About entrance
    gsap.from('.about-eyebrow', { x: -40, opacity: 0, duration: 0.7, delay })
    gsap.from('.about-title', { x: -60, opacity: 0, duration: 0.8, delay: delay + 0.1 })
    gsap.from('.about-text', { y: 30, opacity: 0, duration: 0.7, delay: delay + 0.2 })
    gsap.from('.about-image', { x: 80, opacity: 0, duration: 0.9, delay: delay + 0.1 })
    gsap.from('.about-stats', { y: 30, opacity: 0, duration: 0.6, delay: delay + 0.3 })
    gsap.from('.about-certs', { y: 40, opacity: 0, duration: 0.6, delay: delay + 0.4 })
  }
  
  if (sceneIndex === 2) {
    // Services entrance — куб materializes
    gsap.from('.services-menu', { x: -100, opacity: 0, duration: 0.6, delay: delay + 0.4 })
  }
  
  if (sceneIndex === 3) {
    // Projects entrance
    gsap.from('.project-card', { y: 60, opacity: 0, stagger: 0.08, duration: 0.6, delay: delay + 0.3 })
  }
  
  if (sceneIndex === 4) {
    // Contact entrance
    gsap.from('.contact-info', { x: -40, opacity: 0, duration: 0.7, delay })
    gsap.from('.contact-form', { x: 40, opacity: 0, duration: 0.7, delay: delay + 0.1 })
  }
}
```

---

## Технически изисквания

- Всички сцени div: pointer-events-none по default
  Само активната: pointer-events-auto (управлява се в goToScene)
- will-change: "opacity, transform" на всички scene div-ове
- GlobalBackground canvas: position fixed, inset-0, z-index:-1, pointer-events-none
- Navbar: position fixed, top-0, z-index:50
- Navigation dots: position fixed, right-6, z-index:50
- Scene counter: position fixed, bottom-8 left-8, z-index:50
- TypeScript: без any, без @ts-ignore
- Без console.log
- Всички CMS данни от props — без fetch в компонентите
- При липса на данни → graceful fallback, не crash
- Mobile first за touch events

---

## Файлова структура

```
src/
  components/
    PageExperience.tsx          ← главен файл, всички сцени + навигация
    3d/
      GlobalBackground.tsx      ← частици фон (Three.js)
      ServicesCube.tsx          ← 3D куб за услуги (R3F)
  app/
    globals.css                 ← добави journal-grain, kenburns keyframes
```

---

## Ред на изпълнение

1. Прочети src/components/PageExperience.tsx изцяло
2. Прочети src/app/globals.css
3. Създай GlobalBackground.tsx
4. Създай ServicesCube.tsx
5. Обнови globals.css с journal-grain CSS
6. Обнови PageExperience.tsx:
   a. Добави GlobalBackground като първи child
   b. Имплементирай новия goToScene с cross-dissolve
   c. Добави triggerSceneEntrance функция
   d. Обнови Hero сцена (запази съществуващото, добави hero-word classes)
   e. Обнови About сцена спрямо спецификацията
   f. Изгради Services сцена с ServicesCube
   g. Изгради Projects сцена (journal style)
   h. Изгради Contact сцена (без Maps)
7. Провери TypeScript — без грешки
8. Потвърди всички сцени зареждат без crash

## ВАЖНО
При всяка стъпка — прочети файла преди да го редактираш.
Не презаписвай работещ код без да го прочетеш първо.
Запази всички съществуващи props, типове и ref-ове.
