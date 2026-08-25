# ACA Church PKT — Official Web Experience

> **Apostolic Christian Assembly, Pattukkottai, Tamil Nadu**  
> *50+ Years in God's Grace • Rooted in Faith, Growing in Fellowship*

---

## 📁 Project File Structure

```
ACA/
├── index.html                    # Main Single-Page Application (SPA) entry point
│
├── css/                          # Stylesheets & Visual Design System
│   ├── style.css                 # Color tokens, typography, themes (Light/Dark), glassmorphism
│   └── animations.css            # Keyframe animations (marquee, shimmer beams, beacons, pulses)
│
├── js/                           # Modular JavaScript Engines & Controllers
│   ├── hero-canvas.js            # 192-frame sequence preloading & scroll-scrub rendering engine
│   ├── vision-canvas.js          # 541-frame Bible opening sequence & Vision 01 interactive timeline
│   ├── prayer.js                 # Prayer category chips, deep-linking, character counter, & form submission
│   └── main.js                   # Application lifecycle, sticky navbar, theme toggle, mobile drawer, & lightbox
│
├── images/                       # Static media assets (Pastor portrait, Bible textures, posters)
│   ├── Pastor.jpeg
│   ├── closed-bible.jpg
│   └── poster.png
│
├── hero image/                   # Sanctuary reveal frame sequence (frame_001.jpg – frame_192.jpg)
│
├── vision_frames/                # Sacred Scripture reveal frame sequence (frame_001.jpg – frame_541.jpg)
│
└── README.md                     # Project architecture & documentation
```

---

## 🌟 Core Architecture & Key Modules

### 1. Dual Canvas Scroll Engines
- **Hero Canvas (`js/hero-canvas.js`)**:
  - Preloads and renders a 192-frame high-resolution sequence of the church sanctuary.
  - Features smooth scroll-scrubbing with DPR auto-scaling and responsive text reveals (*Proverbs 3:5-6*).
- **Vision 01 Canvas (`js/vision-canvas.js`)**:
  - Controls a 541-frame sequence showcasing the sacred opening of the Holy Bible.
  - Interactive playback modes: Scroll Scrubbing, Scrubber Slider, Scene Quick-Jump pills, and 12s Cinematic Auto-Play.
  - Integrated Prayer Pledge counter syncing with local storage.

### 2. Design System & Theming (`css/style.css` & `css/animations.css`)
- **Theme Variables**: Dual Light Mode (Warm Ivory & Gold) and Dark Mode (Midnight Navy & Bright Gold) with persistent state.
- **Bilingual Typography**: Seamless blend of *Noto Serif Tamil*, *Cormorant Garamond*, *Cinzel*, and *Inter*.
- **Micro-Animations**: Shimmering light beams across sacred imagery, green live beacon status, luxury card lift effects, and infinite marquee tracks.

### 3. Prayer Request System (`js/prayer.js`)
- **Marquee Deep-Linking**: Interactive prayer cards that smooth-scroll to the form with category auto-selection and pulse highlight.
- **Visual Category Chips**: Interactive one-click pills with icons for *Healing*, *Family*, *Guidance*, *Provision*, *Thanksgiving*, and *Other*.
- **Live Form Validation**: 500-character live counter with alert thresholds, loading spinner, and celebratory *Jeremiah 33:3* blessing card.

---

## 🚀 Running Locally

You can preview the project with any local HTTP server:

```bash
# Using Python 3
python3 -m http.server 3000

# Open in your browser
open http://localhost:3000
```
