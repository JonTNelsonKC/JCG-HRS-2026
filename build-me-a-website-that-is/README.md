# Ricky Stenhouse Jr. Superfans

A local terminal-hosted fan dashboard for Ricky Stenhouse Jr. and the No. 47 HYAK Motorsports Chevrolet.

## Run

```bash
npm start
```

Open `http://127.0.0.1:5173`.

The Wreckhouse archive lives at `http://127.0.0.1:5173/wreckhouse.html`, and the dashboard header links to it.

Set a different port if needed:

```bash
PORT=3000 npm start
```

## Data

The server polls NASCAR public race feeds for schedule, weekend, and live leaderboard data. During live race windows, the browser refreshes every 3 seconds and the server keeps the live feed cache to roughly 2.5 seconds. It also reads the official NASCAR driver stats page through a text fallback so the dashboard still has current season and career stats when the live race feed is not active.
