# Weekly Log // Inspiration & Cultural Tip-offs Bulletin Board

A minimal, visually refined web application that functions as a public log/journal of cool inspiration, resources, articles, and cultural tip-offs. 

The application is built using **Next.js (App Router)** and **Vanilla CSS**, featuring responsive grid layouts and animations inspired by Material 3 design systems.

---

## 🚀 Key Features

* **Visual & Minimal**: Clean design focusing on high contrast (grayscale with vibrant neon pops of color for category labels).
* **Timeline Navigation**: Grouped by volume/week logs.
* **Automatic Ingestion**: Built-in webhook endpoint (`/api/webhook`) that auto-scrapes link metadata (title, descriptions, and OpenGraph preview images) and appends them to a Git-backed local database file.
* **Custom Fallbacks**: Beautiful component representations for non-visual bookmarks, including a custom-styled Google Chrome omnibox trick viewer.

---

## 🛠️ Tech Stack & Architecture

* **Framework**: Next.js (App Router + TypeScript)
* **Styling**: Vanilla CSS (modular component styling with CSS variables)
* **Database**: Flat JSON Database (`src/data/bookmarks.json`)
* **Deployments**: Vercel (recommended) or any serverless-compatible host.

---

## 📦 Getting Started

### 1. Run Locally
First, clone the repository and install dependencies:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

### 2. Testing the Webhook
You can simulate a Google Chat webhook event locally by calling the API route:

```bash
curl -X POST -H "Content-Type: application/json" \
-d '{"text": "Check out this beautiful portfolio: https://coleorloff.com/"}' \
http://localhost:3000/api/webhook
```

---

## ⚡ Deployment & Google Chat Integration

To enable fully automated, zero-maintenance ingestion:

1. **Deploy to Vercel**: Connect this GitHub repository to Vercel.
2. **Add Environment Variables**:
   * `GITHUB_TOKEN`: A GitHub Personal Access Token (PAT) with write access to this repository.
   * `GITHUB_REPOSITORY`: Your repository name (e.g., `username/bulletin-board`).
3. **Configure Google Chat Webhook**:
   * In your Google Chat Space, go to **Apps & Integrations** > **Webhooks**.
   * Add a new webhook and set the URL to your deployed Vercel endpoint: `https://your-app.vercel.app/api/webhook`.
   * Now, whenever you or your team share a link in that space, it will be automatically scraped, committed to this repository, and Vercel will rebuild and publish it within seconds!
