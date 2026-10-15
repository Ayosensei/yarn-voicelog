# 🎨 Yarn Frontend

This directory contains the [Next.js 16](https://nextjs.org) App Router frontend for **Yarn**, built with React 19, Tailwind CSS, and full Progressive Web App (PWA) offline capabilities.

For the complete project overview, architecture, and backend instructions, see the [Root README](../README.md).

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create `.env.local` based on `.env.example`:

```bash
cp .env.example .env.local
```

Set the values:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📦 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Runs the Next.js development server with Turbopack |
| `npm run build` | Builds the optimized production application |
| `npm run start` | Runs the built production server locally |
| `npm run lint` | Runs ESLint checks |

---

## 📱 PWA & Offline Support

- **Manifest:** Configured at [`public/manifest.json`](public/manifest.json).
- **Service Worker:** Registered at [`public/sw.js`](public/sw.js) for runtime asset caching and offline memo drafting.
- **Provider:** [`src/components/PWAProvider.jsx`](src/components/PWAProvider.jsx) handles connectivity listeners and custom install banners.
