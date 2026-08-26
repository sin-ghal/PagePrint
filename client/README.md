# PagePrint - Next.js Client

This is the Next.js version of the PagePrint frontend (converted from Vite + React).

## Getting Started

```bash
# Install dependencies
npm install

# Create .env.local file with your backend URL
# NEXT_PUBLIC_BACKEND_URL=http://localhost:4000

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
client-next/
├── app/
│   ├── layout.jsx          # Root layout (Toaster, metadata)
│   ├── globals.css         # Global styles (Tailwind)
│   ├── page.jsx            # Landing page (/)
│   ├── login/page.jsx      # Login page
│   ├── register/page.jsx   # Register page
│   ├── forgot-password/page.jsx
│   ├── dashboard/page.jsx  # Shopkeeper dashboard (protected)
│   ├── my-qr/page.jsx      # QR code page (protected)
│   ├── shop/[shopSlug]/page.jsx   # Customer upload page
│   └── status/[jobId]/page.jsx    # Job tracking page
├── components/
│   └── TaglineTyper.jsx    # Typewriter component
├── services/
│   └── api.js              # Axios instance
├── public/
│   └── favicon.svg
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Route Mapping (Vite → Next.js)

| Old Route (React Router) | New Route (Next.js App Router) |
|--------------------------|-------------------------------|
| `/`                      | `app/page.jsx`                |
| `/login`                 | `app/login/page.jsx`          |
| `/register`              | `app/register/page.jsx`       |
| `/forgot-password`       | `app/forgot-password/page.jsx`|
| `/dashboard`             | `app/dashboard/page.jsx`      |
| `/my-qr`                 | `app/my-qr/page.jsx`          |
| `/shop/:shopSlug`        | `app/shop/[shopSlug]/page.jsx`|
| `/status/:jobId`         | `app/status/[jobId]/page.jsx` |

## Key Changes from Vite Version

- `react-router-dom` → Next.js file-based routing + `next/navigation`
- `useNavigate()` → `useRouter()` from `next/navigation`
- `useParams()` → `useParams()` from `next/navigation`
- `<Link to="">` → `<Link href="">` from `next/link`
- `import.meta.env.VITE_*` → `process.env.NEXT_PUBLIC_*`
- All pages use `"use client"` directive (client-side interactivity)
- Tailwind CSS v3 with PostCSS (instead of Tailwind v4 Vite plugin)

## Deployment

Deploy to Vercel:
```bash
npx vercel
```

No `vercel.json` needed — Next.js handles routing natively.
