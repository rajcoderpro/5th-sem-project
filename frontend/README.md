# WorkForce AI frontend starter

A modular React + Vite + Tailwind CSS landing page with GSAP entrance animation, Framer Motion section animations, Lucide icons, and basic `/` and `/login` routes.

## Setup

```bash
npm install
npm run dev
```

The Tailwind configuration uses the Tailwind CSS v3 directives in `src/index.css`. If using Tailwind v4 in an existing app, adjust the CSS and Vite/Tailwind plugin setup to the v4 installation instructions.

## Structure

```text
src/
├── components/
│   ├── DashboardPreview.jsx
│   ├── Footer.jsx
│   ├── Navbar.jsx
│   └── SectionHeading.jsx
├── data/
│   └── landingContent.js
├── pages/
│   ├── LandingPage.jsx
│   └── LoginPage.jsx
├── App.jsx
├── index.css
└── main.jsx
```

The dashboard figures and task rows in `DashboardPreview.jsx` are illustrative UI data, not live backend analytics. The login screen is a placeholder and is not wired to the API yet.
