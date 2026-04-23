[README.md](https://github.com/user-attachments/files/27005480/README.md)
# 🏡 LekkerStay CT

> **Find a lekker spot in Cape Town — without the gatvol.**
> Real rents. Real safety. Real talk from locals.

LekkerStay CT is a community-powered rental transparency platform for Cape Town. Skip the dodgy listings and the price-gouging — see what locals actually pay, what neighbourhoods actually feel like, and whether that asking price is fair before you sign.

🌍 **Live app:** [lekkerstayct.lovable.app](https://lekkerstayct.lovable.app)

---

## 💡 Why this exists

Renting in Cape Town is rough: prices vary wildly between suburbs (and even between blocks), listings often hide the truth about loadshedding, safety, and transport, and there's no easy way to know if you're being charged a fair rate.

LekkerStay CT fixes that by crowdsourcing the truth from people who actually live here — howzit, awê, and welcome to a more transparent rental scene.

---

## ✨ Core Features

| Feature | What it does |
|---|---|
| 🗺️ **Area Explorer** | Pick a suburb → see avg rent, safety score (★★★★★), Eskom status, traffic chatter, and live listings |
| 💰 **Fair Price Tool** | Enter a rent + suburb + bedrooms → instant verdict on whether it's a steal, fair, or a rip-off |
| 📡 **Neighbourhood Pulse** | Live feed of local reports: power cuts, water issues, safety, traffic, community vibes |
| 🎯 **Match Me Quiz** | 4-step quiz (budget → areas → bedrooms → vibe) → personalised matches with "Lekker Deal" flags |
| 🔥 **Discover Deals** | Aggregated external listings sorted by price, with affordability badges |
| 📝 **Submit Rental** | Locals share rentals they know about — rent, vibe checks, photos |
| ☕ **Drop the Tea** | Submit pulse reports about your suburb (anonymous-feeling, signed-in safe) |
| ⭐ **Saved Suburbs** | Bookmark areas you're watching, see them on your dashboard |
| 🚩 **Report Listing** | Flag dodgy or out-of-date rentals |
| 🔗 **Share Listing** | One-click share with deep links to specific suburbs |

---

## 🛠️ Tech Stack

**Frontend**
- ⚛️ React 18 + TypeScript
- ⚡ Vite 5
- 🎨 Tailwind CSS v3 + shadcn/ui
- 🎬 Framer Motion (page + list animations)
- 🧭 React Router v6
- 🍞 Sonner (toasts)
- 🔣 Lucide React (icons)

**Backend (Lovable Cloud)**
- 🔐 Auth (email/password + Google OAuth)
- 🗄️ Postgres with Row Level Security (RLS) on every table
- 📦 Storage (rental photos, user-scoped folders)
- 📡 Realtime subscriptions (rentals + pulse_reports)

**Design language**
- Ocean blues, mountain greens, SA gold accents
- Space Grotesk headings, Inter body
- Cape Town slang throughout (howzit, lekker, awê, eish, sharp-sharp)

---

## 🚀 Local Development

### Prerequisites
- [Bun](https://bun.sh/) (or Node 18+ with npm)
- A Lovable Cloud / Supabase project (auto-provisioned if you fork via Lovable)

### Setup

```bash
# 1. Clone
git clone <your-repo-url>
cd lekkerstay-ct

# 2. Install
bun install
# or: npm install

# 3. Run dev server
bun run dev
# or: npm run dev
```

App runs at `http://localhost:8080`.

### Environment variables

`.env` is auto-managed by Lovable Cloud. If you're running outside Lovable, you'll need:

```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
VITE_SUPABASE_PROJECT_ID=<your-project-ref>
```

> ⚠️ Never commit secret/service-role keys. Only the publishable (anon) key belongs in the frontend.

---

## 📂 Project Structure

```
src/
├── components/           # Reusable UI
│   ├── ui/               # shadcn/ui primitives
│   ├── AreaExplorer.tsx  # Suburb deep-dive
│   ├── DiscoverDeals.tsx # External listings grid
│   ├── SuburbSelect.tsx  # Grouped suburb dropdown
│   ├── Navbar.tsx
│   └── ...
├── pages/
│   ├── Dashboard.tsx     # Home: hero, tabs, my areas, alerts, pulse
│   ├── Area.tsx          # /area/:slug deep link
│   ├── FairPrice.tsx     # Rent verdict tool
│   ├── MatchMe.tsx       # 4-step matching quiz
│   ├── SubmitRental.tsx
│   ├── SubmitPulse.tsx
│   ├── Auth.tsx          # Sign in / sign up
│   └── NotFound.tsx
├── hooks/
│   ├── useAuth.tsx       # Supabase session wrapper
│   └── useSavedSuburbs.ts
├── lib/
│   ├── suburbs.ts        # Grouped CT suburb list
│   └── utils.ts
├── integrations/
│   └── supabase/         # Auto-generated client + types
└── index.css             # Design tokens (HSL)
```

---

## 🗄️ Database Schema

All tables live in the `public` schema with RLS enabled.

| Table | Purpose | Key columns |
|---|---|---|
| `profiles` | Per-user profile (no email exposure) | `user_id`, `display_name`, `avatar_url` |
| `rentals` | Community-submitted rentals | `suburb`, `monthly_rent`, `bedrooms`, vibe-check booleans, `photo_urls`, `user_id` |
| `pulse_reports` | Live neighbourhood reports | `suburb`, `report_type`, `description`, `photo_url`, `user_id` |
| `saved_suburbs` | User bookmarks | `user_id`, `suburb` |
| `rental_reports` | Flagged listings | `rental_id`, `user_id`, `reason`, `details` |
| `external_listings` | Aggregated public deals | `suburb`, `monthly_rent`, `bedrooms`, `source_name`, `source_url` |

**Security highlights**
- Profiles are **not** publicly readable — only authenticated users.
- Rental photos are stored in user-scoped folders (`rental-photos/{user_id}/...`); only the owner can update/delete.
- Inserts/updates everywhere are gated by `auth.uid() = user_id`.

**Realtime channels**
- `rentals` (INSERT) → dashboard refresh
- `pulse_reports` (INSERT) → live pulse feed

---

## 🚢 Deployment

### Publish via Lovable
1. Open the project in [Lovable](https://lovable.dev).
2. Click **Publish** (top right).
3. Your app goes live at `<project>.lovable.app`.

### Custom domain
- Project → **Settings → Domains → Connect Domain**
- Requires a paid Lovable plan.
- Docs: [Custom domain setup](https://docs.lovable.dev/features/custom-domain)

---

## 🤝 Contributing

This started as a SA Startup Week build, but PRs and ideas are welcome:
- New suburb data / corrections
- Better safety/vibe heuristics
- Additional pulse report types
- Accessibility improvements

Open an issue first if you're planning a big change — let's chat.

---

## 👤 Credits

Built with ❤️ in Cape Town by **Laura Bailie** during **SA Startup Week**.

Powered by [Lovable](https://lovable.dev) (Lovable Cloud + AI Gateway).

---

## 📜 License

MIT — do something lekker with it.

---

> _"Sharp-sharp, bru. Now go find your spot."_ 🌊⛰️
