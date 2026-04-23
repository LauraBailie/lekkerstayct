# 🏖️ LekkerStay CT

> **Transparent rentals. Real-time neighbourhood pulse. Made for Capetonians.**

LekkerStay CT is a community-powered rental transparency platform built for Cape Town. It surfaces real rental prices, fair-price benchmarks, and live neighbourhood insights — so locals can find a lekker spot without getting hustled.

🌐 **Live app:** [lekkerstayct.lovable.app](https://lekkerstayct.lovable.app)

---

## ✨ About

Cape Town's rental market is opaque, fast-moving, and full of inflated listings. LekkerStay CT flips the script by letting the community share what they actually pay, what's happening on their street, and which suburbs are worth the move. Think of it as a neighbourhood WhatsApp group, a fair-price calculator, and a property explorer rolled into one.

Built by **Laura Bailie** at **SA Startup Week**.

---

## 🎯 Core Features

### 🗺️ Area Explorer
- Browse any Cape Town suburb and see average rent, recent listings, and a live safety score
- ⭐ **1–5 star Safety Score** colour-coded from green (safe) to red (caution), based on recent community pulse reports
- Real-time updates via Supabase realtime subscriptions
- Save your favourite suburbs to "My Areas"

### 💰 Fair Price Tool
- Enter a suburb, bedroom count, and asking rent
- Instantly see whether the price is a steal, fair, or a rip-off — compared against community-submitted data

### 📡 Neighbourhood Pulse
- Locals drop quick reports on safety, traffic, loadshedding, and general vibes
- Live feed on the dashboard with timestamps and category icons
- Powers the safety score and "what's happening now" picture for each suburb

### 🏠 Submit a Rental
- Share what you actually pay so the community gets honest data
- Capture vibe checks: braai-friendly, near MyCiTi, loadshedding-friendly, walking distance to shops, good schools, near taxi rank
- Photos uploaded to user-scoped storage folders (RLS-protected)

### 🎯 Match Me
- 4-step quiz: budget → preferred areas → bedrooms → vibe (quiet, vibey, family, student)
- Returns matching listings with **"LEKKER DEAL"** badges for anything ≤ 85% of the suburb average

### 🔥 Discover Deals
- Curated grid of active external listings, sorted by price
- Auto-flags affordable spots (≤ 90% of overall average) with a special badge

### 📤 Share & Report
- One-click "Share this listing" copies a nicely formatted message with price, suburb, and details
- Report dodgy listings (price wrong, already taken, other) with duplicate-protection

### 📊 Dashboard
- Animated hero with the LekkerStay tagline
- Affordability heatmap across all tracked suburbs
- Fair Price alerts for listings 15%+ below average
- Live pulse feed of community reports

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite 5 + TypeScript |
| Styling | Tailwind CSS v3 + shadcn/ui + custom HSL design tokens |
| Animation | Framer Motion |
| Backend | Lovable Cloud (Supabase) — Postgres, Auth, Storage, Realtime |
| Auth | Email/password + Google OAuth |
| Routing | React Router v6 |

### Design System
- **Palette:** Ocean blues, mountain greens, SA gold accents
- **Type:** Space Grotesk (headings) + Inter (body)
- **Tone:** Warm, professional, proudly Capetonian — with the right pinch of *howzit*, *lekker*, and *sharp-sharp*

---

## 🗄️ Database Schema

| Table | Purpose |
|-------|---------|
| `rentals` | Community-submitted rental listings with vibe-check booleans |
| `external_listings` | Curated deals from external sources |
| `pulse_reports` | Neighbourhood reports (safety, traffic, loadshedding, etc.) |
| `profiles` | User profile data (display name, avatar) |
| `saved_suburbs` | Per-user saved areas |
| `rental_reports` | User-submitted reports flagging dodgy listings |

All tables are protected with Row-Level Security policies. Storage uses user-scoped folders (`rental-photos/{user_id}/...`) so people can only modify their own uploads.

---

## 🚀 Getting Started

```bash
# Install
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

The app connects to Lovable Cloud automatically — no `.env` setup required when working inside Lovable. For self-hosting, you'll need `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `VITE_SUPABASE_PROJECT_ID`.

---

## 🗺️ Suburbs Covered

Six grouped regions across the Cape: Atlantic Seaboard, City Bowl & Surrounds, Southern Suburbs, South Peninsula, Northern Suburbs, and Cape Flats — covering everywhere from Sea Point to Stellenbosch.

---

## 🤝 Contributing

This is an open community project. Found a bug? Want to add a feature? PRs welcome. Built with love (and a strong filter coffee) at SA Startup Week.

---

## 👤 Built By

**Laura Bailie** — SA Startup Week 2025

---

## 📄 License

MIT — go build something lekker.
