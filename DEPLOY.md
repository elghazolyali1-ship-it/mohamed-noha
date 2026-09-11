# Deploying Mohamed & Noha's wedding site (Vercel + MongoDB)

## 1. MongoDB Atlas (free tier is enough)
1. Create a free cluster at https://www.mongodb.com/cloud/atlas.
2. Create a database user (username + password).
3. Network Access -> allow access from anywhere (`0.0.0.0/0`), since Vercel functions use dynamic IPs.
4. Copy the connection string (looks like `mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority`).

## 2. Deploy to Vercel
```bash
npm i -g vercel   # if not installed
vercel login
vercel            # first deploy, follow the prompts (link/create project)
```

In the Vercel dashboard, go to **Project -> Settings -> Environment Variables** and add:

| Name | Value |
|---|---|
| `MONGODB_URI` | your Atlas connection string |
| `MONGODB_DB` | `wedding` (optional, defaults to `wedding`) |
| `RSVP_ADMIN_KEY` | a long random string (required to view RSVPs on the dashboard) |

Then redeploy:
```bash
vercel --prod
```

## 3. How it works
- `index.html` is served as a static page.
- `api/rsvp.js` is a serverless function:
  - `POST /api/rsvp` — saves a new RSVP (name, attending) into the `rsvps` collection.
  - `GET /api/rsvp?key=RSVP_ADMIN_KEY` — lists all RSVPs as JSON (only works if `RSVP_ADMIN_KEY` is set and matches).
- The RSVP popup form on the page posts to `/api/rsvp` and shows a thank-you message on success.
- `rsvps.html` is a dashboard page for the couple to view responses: go to `https://<your-site>/rsvps.html`, enter the `RSVP_ADMIN_KEY` once (it's remembered for the browser session), and see everyone's name, attendance status, and submission time — with a search box and live totals. You can also open `https://<your-site>/rsvps.html?key=YOUR_KEY` directly to skip the key prompt (handy for a bookmark, but don't share that link publicly).

## 4. Local testing
```bash
npm install
vercel dev
```
This runs the site + API locally (needs `MONGODB_URI` in a local `.env` file — see `.env.example`).
