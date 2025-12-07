# RunbookForge Landing Page

A modern, dynamic landing page built with:
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion** (animations)
- **Lucide React** (icons)

## Features

- ✨ Smooth scroll animations
- 🎨 Modern dark theme with gradients
- 📱 Fully responsive design
- ⚡ Fast performance
- 🔄 Interactive components
- 🎯 SEO optimized

## Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## Deploy to Vercel (Recommended)

### Option 1: One-Click Deploy

1. Push this code to a GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Click "Add New Project"
4. Import your GitHub repository
5. Click "Deploy"

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## Connect Your Domain

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add `runbookforge.com`
4. Update your domain's DNS:
   - Add an A record pointing to `76.76.21.21`
   - Or add a CNAME record pointing to `cname.vercel-dns.com`

## Customization

### Update Waitlist Form

Replace the form action in `src/app/page.tsx`:

```tsx
// Option 1: Formspree (free)
<form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">

// Option 2: ConvertKit
<form action="https://app.convertkit.com/forms/YOUR_FORM_ID/subscriptions">
```

### Update Colors

Edit `tailwind.config.js` to change the color scheme.

### Update Content

All content is in `src/app/page.tsx`. Edit text, add sections, or modify components.

## Project Structure

```
runbookforge-next/
├── src/
│   ├── app/
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout with metadata
│   │   └── page.tsx        # Main landing page
│   └── components/         # Reusable components (future)
├── public/                 # Static assets
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

## Next Steps

1. Set up email capture (Formspree, ConvertKit, or Mailchimp)
2. Add analytics (Vercel Analytics, Plausible, or Google Analytics)
3. Create additional pages (blog, docs, about)
4. Add authentication when ready for MVP

## Support

Built by StepUpTech Academy.

---

© 2025 RunbookForge
