# My Closet — Setup Guide

Your AI-powered personal stylist. Here's how to get it live on your phone in about 30 minutes.

---

## What you'll need
- A free [Cloudflare account](https://dash.cloudflare.com/sign-up)
- A free [GitHub account](https://github.com)
- An [Anthropic API key](https://console.anthropic.com) (~$5/month typical usage)
- Node.js installed on your computer ([download](https://nodejs.org))

---

## Step 1 — Push to GitHub (5 min)

```bash
cd closet-app
git init
git add .
git commit -m "Initial commit"
```

Then create a new repo on GitHub (github.com → New repository → name it `my-closet`) and push:

```bash
git remote add origin https://github.com/YOUR_USERNAME/my-closet.git
git branch -M main
git push -u origin main
```

---

## Step 2 — Set up Cloudflare D1 database (5 min)

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → Workers & Pages → D1
2. Click **Create database** → name it `closet-db` → Create
3. Copy the **Database ID** (looks like `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
4. Open `wrangler.toml` and paste your ID where it says `YOUR_D1_DATABASE_ID`
5. In the D1 dashboard, click your database → **Console** tab
6. Paste the contents of `schema.sql` and click **Execute**

---

## Step 3 — Set up Cloudflare R2 photo storage (5 min)

1. In Cloudflare dashboard → R2 Object Storage → Create bucket
2. Name it `closet-photos` → Create
3. Click the bucket → Settings → **Public Access** → Allow access
4. Copy your **Public URL** (looks like `https://pub-xxxxxxxx.r2.dev`)
5. In `functions/api/[[route]].js`, find this line:
   ```js
   const url = `https://pub-YOUR_ACCOUNT.r2.dev/${key}`
   ```
   Replace `pub-YOUR_ACCOUNT` with your actual public URL prefix.

---

## Step 4 — Deploy to Cloudflare Pages (5 min)

1. In Cloudflare dashboard → Workers & Pages → Create application → Pages
2. **Connect to Git** → Select your `my-closet` GitHub repo
3. Build settings:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Click **Save and Deploy**

---

## Step 5 — Connect your database and storage (3 min)

After deploy, go to your Pages project → Settings → **Bindings**:

1. **Add binding** → D1 Database
   - Variable name: `DB`
   - Select: `closet-db`

2. **Add binding** → R2 Bucket
   - Variable name: `PHOTOS`
   - Select: `closet-photos`

---

## Step 6 — Add your API key (2 min)

Still in Pages → Settings → **Environment variables**:

1. Click **Add variable**
   - Variable name: `ANTHROPIC_API_KEY`
   - Value: your key from [console.anthropic.com](https://console.anthropic.com)
   - Check **Encrypt**

2. Redeploy: Pages → Deployments → Retry deployment

---

## Step 7 — Install on your phone (2 min)

1. Visit your app URL (shown in Cloudflare Pages — looks like `my-closet.pages.dev`)
2. **On iPhone**: Tap the Share button → **Add to Home Screen** → Add
3. **On Android**: Tap the menu (⋮) → **Add to Home Screen** → Install

It'll appear as an app icon on your home screen. Tap it and it opens full-screen, no browser chrome.

---

## Your app URL
Once deployed, your app lives at: `https://my-closet.pages.dev`

You can add a custom domain in Cloudflare Pages → Custom domains if you want something like `closet.yourname.com`.

---

## Cost estimate
- Cloudflare Pages: **Free** (unlimited requests)
- D1 Database: **Free** (up to 5GB, 25M reads/day)
- R2 Storage: **Free** (up to 10GB)
- Anthropic API: **~$1–5/month** depending on how much you chat with your stylist

Total: basically just the API key cost.

---

## Troubleshooting

**App loads but data doesn't save**: Check your D1 binding is set up correctly in Pages → Bindings

**Photos don't load**: Make sure R2 public access is enabled and you updated the URL in the API file

**AI stylist not responding**: Check your `ANTHROPIC_API_KEY` environment variable is set and the app was redeployed after adding it

**Can't find your Cloudflare Database ID**: D1 dashboard → click your database → the ID is shown at the top

---

## Adding more items quickly

The fastest way to build your digital wardrobe is a photo audit session:
1. Lay out sections of your closet
2. Open the app → tap **+ Add**
3. Take a photo directly in the app
4. Fill in the quick details
5. Tap **Analyze with AI** to get an instant assessment

Do 10-15 minutes a day for a week and you'll have your whole closet catalogued.
