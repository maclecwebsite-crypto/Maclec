# MACLEC Project — Agent Guide

## Overview

MACLEC (Energy Through Innovation) is a company website for a clean energy startup that pioneers **dam-free, reservoir-free hydropower** using **Surface Hydrokinetic Turbine Technology (SHKT)**. The project consists of 7 interconnected HTML pages with shared CSS/JS infrastructure and page-specific assets.

---

## 1. Project Structure

```
MACLEC/
├── Agent.md                 # This file — project documentation
├── index.html               # Home page (landing, about, stats, partners, carousel, why SHKT, industries, recognition)
├── style.css                # Global styles (1411 lines)
├── script.js                # Global JS (loading, mobile nav, hero video, carousel + video modal)
│
├── technology.html          # Technology page (comparison, advantages, where SHKT works, global potential)
├── technology.css           # Technology-specific styles (449 lines)
├── technology.js            # Table row hover sync, tech hero video
│
├── atlas.html               # Global Hydrokinetic Potential Atlas™ (assessment form, digital twin, results)
├── atlas.css                # Atlas-specific styles (780 lines)
├── atlas.js                 # Assessment form logic, digital twin (2D SVG + 3D Three.js), power calculations
├── river3d.js               # Three.js 3D river scene (384 lines)
│
├── projects.html            # Project Explorer (interactive map, filterable cards, modal)
├── projects.css             # Projects-specific styles (337 lines)
├── projects.js              # Project data array, map pins, card rendering, filters, modal (216 lines)
│
├── gallery.html             # Gallery page (image/video grid, lightbox, video modal)
├── gallery.css              # Gallery-specific styles (648 lines)
├── gallery.js               # Loading screen, filter, lightbox, video modal, mobile nav (171 lines)
│
├── career.html              # Careers page (job listings, accordion, filters, search, application modal)
├── career.css               # Careers-specific styles (950 lines)
├── career.js                # Loading, job accordion, filters, search, application form (181 lines)
│
├── feasibility.html         # Feasibility Study request form
├── feasibility.css          # Feasibility-specific styles
├── feasibility.js           # Form handling, file upload UI
│
└── img/                     # Image assets directory
    ├── logo.png
    ├── favicon.ico / favicon-16x16-v2.png / favicon-32x32-v2.png
    ├── *.png (partner logos, turbine images)
    ├── *.mp4 (video assets)
    └── ...
```

---

## 2. Technology Stack

| Layer | Technology |
|-------|-----------|
| **HTML** | Semantic HTML5 with ARIA attributes |
| **CSS** | Custom properties (design tokens), Grid, Flexbox, responsive breakpoints, animations |
| **JavaScript** | Vanilla JS (no frameworks) |
| **3D Rendering** | Three.js r128 (via CDN: `cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`) |
| **Fonts** | Google Fonts: Space Grotesk (display), Manrope (body) |
| **Icons** | Inline SVGs throughout |
| **Images** | Unsplash external images + local assets in `img/` |
| **Hosting** | Static site — no backend |

---

## 3. Design System (CSS Custom Properties)

Defined in `style.css:root` (also duplicated per-page in gallery.css, career.css):

```css
--primary: #2a3b7e;        /* Deep navy/blue — main brand color */
--primary-light: #3d52a8;
--primary-soft: #e8ecf8;
--eco: #039846;             /* Green — positive indicators */
--energy: #ef7f1b;          /* Orange/amber — CTAs, emphasis */
--energy-light: #f0953d;
--bg: #ffffff;
--bg-warm: #f7f9fc;
--text: #0f172a;
--text-secondary: #475569;
--text-muted: #64748b;
--border: #e2e8f0;
--font-display: "Space Grotesk", sans-serif;
--font-body: "Manrope", sans-serif;
```

### Shared Component Classes

- `.about-tag` — Section label (pill badge with border)
- `.about-title` — Section heading (clamp font size)
- `.about-intro` — Section description text
- `.accent` — Highlight color (primary)
- `.btn-primary` — Solid primary button
- `.btn-outline` — Outlined primary button
- `.btn-outline-pill` — Pill-shaped outline button (header CTA)
- `.site-header` — Sticky/absolute header
- `.main-nav` — Navigation links
- `.nav-toggle` — Mobile hamburger menu
- `.site-footer` — Footer with logo, links, copyright

---

## 4. Page Details

### 4.1 Index (`index.html`)
- **Hero**: Video background, animated globe SVG, tagline, 4 action cards
- **Feature Strip**: 6 feature items (No Dam, No Reservoir, No Civil Structure, 24/7, Modular, Sustainable)
- **Stats Section**: 6 stat cards (50+ MW, 2.5M kg CO2, 10+ countries, 100+ GW, 40+ yrs, ₹1,600+ Cr)
- **Partners Section**: 8 partner logos (DSIR, Startup India, CEA, MNRE, NITI Aayog, IIT Roorkee, WWF, UNDP)
- **Media Carousel**: Video thumbnails with modal player
- **About Section**: Timeline (2008-2025+), 4 pillar cards
- **Why SHKT**: Comparison table (Conventional vs SHKT), 6 advantage cards
- **Industries**: 6 industry cards with benefits and scale indicators
- **Recognition Timeline**: 7 timeline items with badges

### 4.2 Technology (`technology.html`)
- Hero with video background
- Comparison table with hover-highlight across rows (JS-driven)
- 6 advantage cards with images
- Where SHKT Works — image tiles (6 items)
- Global Potential — stats grid
- Validation Timeline — horizontal timeline with dots
- Closing CTA section

### 4.3 Atlas (`atlas.html`)
- Hero with rotating globe SVG and animated nodes
- 3-step assessment form:
  1. Location selection (country, state, place, coordinates, water source type with visual radio cards)
  2. Site parameters (6 range sliders: width, depth, velocity, discharge, variation, length)
  3. AI Location Assist (4 placeholder options)
- Live Digital Twin panel:
  - Cross-section view (SVG with animated flow lines and turbine visualization)
  - 3D Side View (Three.js river scene — `river3d.js`)
  - Live power estimate and turbine count
- Results dashboard (commented out in HTML but functional in JS)
- Before/After visualization toggle
- Global Projects Layer section
- Unique Features grid

### 4.4 Projects (`projects.html`)
- Hero with world map background
- Filter bar: All, Completed, Ongoing, Government, PSU, International, SHKT, SHK-PSP
- Interactive world map with SVG landmass path, dot clusters, and project pins
- Project cards grid (3-column) with images, status badges, capacity, location
- 9 project data entries covering India, Oman, Kenya, Uzbekistan, Australia, USA
- Detail modal with image, status, tech, description, stats, CTA

### 4.5 Gallery (`gallery.html`)
- Hero with background image
- Filter bar: All, Turbines, Installations, Projects, Team & Events, Videos
- Masonry-like grid (4 columns) with wide/tall items and hidden filter state
- Image cards with hover overlay and zoom button
- Video cards with play button overlay
- Lightbox with prev/next navigation and keyboard support
- Video modal for playable content
- Footer with brand, links, copyright

### 4.6 Career (`career.html`)
- Hero with stats (10+ countries, 50+ MW, TRL-9)
- Why MACLEC — 6 perk cards
- Job listings with:
  - Department filter (Engineering, Operations, Business, R&D)
  - Keyword search with debounced input
  - Accordion expand/collapse (only one open at a time)
  - 8 job positions with detailed responsibilities and requirements
- General application section
- Application modal with form fields (name, email, phone, LinkedIn, portfolio, resume upload, cover letter)
- Form submission simulation with success state

### 4.7 Feasibility (`feasibility.html`)
- Hero section
- Request form: name, organization, email, phone, country, location, file uploads (drawings + photos), notes
- Side panel with 4-step process, CTA to Atlas, and link to Project Explorer

---

## 5. JavaScript Modules

### 5.1 Global (`script.js`)
- Loading screen: 2-second timeout, then fade out
- Mobile nav: toggle hamburger menu, close on link click
- Hero video: IntersectionObserver for play/pause, error fallback
- Media carousel: scroll buttons, video modal with play/pause/close/Escape

### 5.2 Technology (`technology.js`)
- Comparison table: `mouseenter`/`mouseleave` sync hover across rows via `data-row` attributes
- Tech hero video: IntersectionObserver for play/pause

### 5.3 Atlas (`atlas.js`)
- Step navigation via tabs and prev/next buttons
- 6 range sliders with live label updates
- Power estimation: `P = 0.5 * rho * A * v^3 * Cp`
- SVG digital twin rendering: channel resizing, flow line animation, turbine placement
- Assessment calculation: capacity, annual energy, carbon reduction, households, suitability score, tech recommendation
- Before/After toggle
- AI option placeholder interactions
- 3D scene: `RiverScene` instance management, view toggle, parameter sync

### 5.4 River 3D (`river3d.js`)
- Three.js scene with:
  - River bed, banks, water surface (subdivided PlaneGeometry for wave animation)
  - Water ripple via vertex displacement + level bob
  - Turbine group with spinning rotor blades (3-blade design)
  - Flow streak particles drifting downstream
  - Depth ruler with sprite labels
- Orbit controls via pointer drag + wheel zoom (custom, no OrbitControls import)
- `update(params)` method called when sliders change
- `resetView()`, `resize()`, `start()`, `stop()`, `dispose()` methods

### 5.5 Projects (`projects.js`)
- 9 project objects with id, name, country, coordinates, categories, status, capacity, client, tech, benefit, description, image URL
- World dot-grid background generation (6 landmass clusters, 90 dots each)
- Pin rendering with SVG circles, pulse animation, click-to-modal
- Card rendering with status badges and metadata
- Filter synchronization between pins and cards
- Modal open/close with keyboard support

### 5.6 Gallery (`gallery.js`)
- Loading screen with 2.2s timeout
- Filter: show/hide items with hidden class
- Lightbox: update visible items, navigate with prev/next, keyboard arrows, Escape
- Video modal: play/pause/close with keyboard
- Mobile nav toggle

### 5.7 Career (`career.js`)
- Loading screen with 2.2s timeout
- Job accordion: expand one at a time via click on header or toggle button
- Department filter with active state
- Search input with 200ms debounce, matches title, summary, keywords, location
- Job count display, no-results state, clear filters button
- Application modal: open/close with data population, form reset, file upload display, simulated submission

### 5.8 Feasibility (`feasibility.js`)
- Form submission handling with success/failure states
- File upload UI with drag-and-drop placeholder areas
- Form validation

---

## 6. Key Architectural Patterns

### Navigation
- Shared header with `.site-header` class across all pages
- `.site-header--solid` variant for inner pages (sticky with blur)
- Mobile nav toggles `display: flex` via inline styles (script.js) or `.mobile-open` class (gallery.js, career.js)

### Loading Screens
- Present on index.html, gallery.html, career.html
- `.loading-screen` overlay with logo animation
- `body.loading` prevents scroll and hides content
- Removed after 2–2.2s via JS timeout

### Video Handling
- Hero videos use IntersectionObserver for performance
- Video modals share same structure across pages (`.video-modal`)
- Error fallback hides video element to show fallback image

### Responsive Breakpoints
- 1100px — tablet landscape (nav hidden, grid reflows)
- 768px — tablet portrait (single column layouts)
- 640px / 480px — mobile (minimal spacing, compact grids)
- All scrollbars hidden globally via CSS

### Styling Approach
- CSS custom properties for theming
- Class-based BEM-like naming (e.g., `.tadv-card`, `.proj-card-body`)
- Dark backgrounds on technology/projects pages vs light on index/atlas/gallery/career
- Consistent section structure: `.section-name { padding; background; } > .section-name-inner { max-width; margin; padding; }`

---

## 7. Dependencies

- **External**: None for core functionality (except Three.js CDN on atlas.html)
- **Fonts**: Google Fonts (Space Grotesk, Manrope)
- **Images**: Mix of Unsplash URLs and local `img/` assets
- **Browser Support**: Modern browsers (uses ES6, CSS Grid, CSS Custom Properties, IntersectionObserver)

---

## 8. Development Notes

- All JS files use `document.addEventListener('DOMContentLoaded', ...)` or IIFE patterns
- No build tools, bundlers, or package.json — pure static HTML/CSS/JS
- Links to `contact.html` exist in navigation but the file does not exist in the project
- Some video sources reference non-existent files (e.g., `./img/canal-install.mp4`)
- The atlas results section is commented out in HTML but functional in JS
- The front page carousel (`index.html`) references videos (`./img/canal-install.mp4`, `./img/thermal-discharge.mp4`, `./img/modular-array.mp4`, `./img/field-site.mp4`) that do not exist in the `img/` directory
- `.tcompare-section` in technology.css references non-existent CSS variables (`--navy-deep`, `--muted`, `--cyan`, `--cyan-bright`, `--ink`) — likely leftover from a previous dark theme
- `feasibility.html` and `contact.html` are referenced in navigation but `contact.html` is missing from the project