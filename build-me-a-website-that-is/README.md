# Ricky Stenhouse Jr. Superfans

A public-ready fan dashboard for Ricky Stenhouse Jr. and the No. 47 HYAK Motorsports Chevrolet.

## Local Run

```bash
npm start
```

Open `http://127.0.0.1:5173`.

The Wreckhouse archive lives at `http://127.0.0.1:5173/wreckhouse.html`, and the dashboard header links to it.

Set a different port if needed:

```bash
PORT=3000 npm start
```

## Cloudflare Pages

This repo is ready for Cloudflare Pages with GitHub.

Project settings:

```text
Framework preset: None
Build command: exit 0
Build output directory: public
Root directory: /
```

Cloudflare Pages will serve the files in `public/` and automatically turn these files into API routes:

```text
functions/api/dashboard.js -> /api/dashboard
functions/api/wreckhouse.js -> /api/wreckhouse
functions/api/health.js -> /api/health
```

Deploy flow:

1. Push this project to a GitHub repository.
2. In Cloudflare, go to Workers & Pages, create a Pages project, and import the GitHub repo.
3. Use the settings above and deploy.
4. After deployment, open the generated `*.pages.dev` URL.

For a Cloudflare-style local preview, use:

```bash
npm run pages:dev
```

## Data

The shared data layer polls NASCAR public race feeds for schedule, weekend, and live leaderboard data. During live race windows, the browser refreshes every 3 seconds and the API keeps the live feed cache to roughly 2.5 seconds. It also reads the official NASCAR driver stats page through a text fallback so the dashboard still has current season and career stats when the live race feed is not active.
