const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PORT = Number(process.env.PORT || 5173);
const HOST = process.env.HOST || "127.0.0.1";
const SEASON = Number(process.env.SEASON || new Date().getFullYear());
const CUP_SERIES_ID = 1;
const DRIVER_ID = 3888;
const DRIVER_NAME = "Ricky Stenhouse Jr.";

const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, "public");

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

const cache = new Map();

const FALLBACK = {
  generatedAt: "2026-04-26T13:08:14.000Z",
  driver: {
    id: DRIVER_ID,
    name: DRIVER_NAME,
    number: "47",
    team: "HYAK Motorsports",
    manufacturer: "Chevrolet",
    crewChief: "Mike Kelley",
    hometown: "Olive Branch, Mississippi",
    dateOfBirth: "10/2/1987",
    sponsor: "Chef Boyardee",
    officialPage: "https://www.nascar.com/drivers/ricky-stenhouse-jr",
    teamPage: "https://www.hyakmotorsports.com/"
  },
  season: {
    year: 2026,
    rank: "30",
    points: "123",
    pointsBehind: "-334",
    races: "9",
    wins: "0",
    top10: "1",
    top5: "1",
    poles: "0",
    dnf: "1",
    lapsLed: "4",
    avgStart: "20.9",
    avgFinish: "23.778"
  },
  raceLog: [
    { track: "Duel 2 at DAYTONA", start: "19", finish: "7", points: "4" },
    { track: "DAYTONA 500", start: "16", finish: "2", points: "35" },
    { track: "EchoPark Speedway", start: "3", finish: "36", points: "1" },
    { track: "Circuit of The Americas", start: "34", finish: "28", points: "9" },
    { track: "Phoenix Raceway", start: "21", finish: "22", points: "15" },
    { track: "Las Vegas Motor Speedway", start: "23", finish: "29", points: "8" },
    { track: "Darlington Raceway", start: "18", finish: "29", points: "8" },
    { track: "Martinsville Speedway", start: "33", finish: "30", points: "7" },
    { track: "Bristol Motor Speedway", start: "23", finish: "17", points: "20" },
    { track: "Kansas Speedway", start: "16", finish: "21", points: "16" },
    { track: "Talladega Superspeedway", start: "22", finish: "0", points: "0" }
  ],
  annualHistory: [
    { year: "2026", rank: "30", wins: "0", top5: "1", top10: "1", poles: "0", lapsLed: "4", avgStart: "20.90", avgFinish: "23.78" },
    { year: "2025", rank: "30", wins: "0", top5: "1", top10: "3", poles: "0", lapsLed: "8", avgStart: "27.92", avgFinish: "22.89" },
    { year: "2024", rank: "25", wins: "1", top5: "3", top10: "6", poles: "0", lapsLed: "28", avgStart: "25.69", avgFinish: "22.06" },
    { year: "2023", rank: "16", wins: "1", top5: "2", top10: "9", poles: "0", lapsLed: "39", avgStart: "21.83", avgFinish: "17.83" },
    { year: "2017", rank: "13", wins: "2", top5: "4", top10: "9", poles: "1", lapsLed: "56", avgStart: "15.94", avgFinish: "17.08" }
  ],
  careerHighlights: [
    {
      category: "Cup Win",
      year: "2017",
      title: "First Cup victory at Talladega",
      detail: "Broke through at Talladega Superspeedway, the track that keeps showing up in the Stenhouse story."
    },
    {
      category: "Cup Win",
      year: "2017",
      title: "Daytona summer win",
      detail: "Backed up the Talladega breakthrough with a second superspeedway Cup win at Daytona."
    },
    {
      category: "Crown Jewel",
      year: "2023",
      title: "Daytona 500 winner",
      detail: "Won the 65th running of the Daytona 500, the biggest trophy on the NASCAR Cup Series calendar."
    },
    {
      category: "Cup Win",
      year: "2024",
      title: "Talladega again",
      detail: "Scored another Cup victory at Talladega, his most recent win listed by NASCAR."
    },
    {
      category: "Champion",
      year: "2011",
      title: "National series champion",
      detail: "Claimed the first of two straight championships in what is now the NASCAR O'Reilly Auto Parts Series."
    },
    {
      category: "Champion",
      year: "2012",
      title: "Back-to-back title",
      detail: "Repeated as champion one year later, turning a breakout season into a proper reign."
    },
    {
      category: "Award",
      year: "2013",
      title: "Cup rookie of the year",
      detail: "Earned Sunoco Rookie of the Year honors in his first full-time Cup Series campaign."
    }
  ]
};

const ASSETS = {
  hyakLogo: "https://res.cloudinary.com/nascarnextgen/image/upload/c_scale,w_188/q_auto/f_auto/v1/team_Hyak-MS_theme_light_e9kdgw",
  hero: "https://res.cloudinary.com/nascarnextgen/image/upload/c_fill,g_auto,w_1536,h_800/q_auto/f_auto/v1/Hero_Heading_1_Photo_ickz3n",
  cupLogo: "https://res.cloudinary.com/nascarnextgen/image/upload/v1767376095/nascar_cup_series_logo_7_qyriyw.svg"
};

const SOURCES = [
  {
    label: "NASCAR driver stats",
    url: "https://www.nascar.com/drivers/ricky-stenhouse-jr"
  },
  {
    label: "NASCAR public race feeds",
    url: `https://cf.nascar.com/cacher/${SEASON}/race_list_basic.json`
  },
  {
    label: "HYAK Motorsports",
    url: "https://www.hyakmotorsports.com/"
  }
];

const WRECK_MEDIA = {
  5597: {
    title: "Herbst, Stenhouse Jr. and others collected in big Stage 2 wreck",
    type: "NASCAR Video",
    url: "https://www.nascar.com/videos/franchise/nascar-cup-series-highlights/herbst-stenhouse-jr-and-others-collected-in-big-stage-2-wreck/",
    secondaryUrl: "https://www.nascar.com/videos/franchise/nascar-cup-series-highlights/in-car-cameras-views-of-multicar-wreck-at-echopark-speedway/"
  }
};

const NOTABLE_WRECKS = [
  {
    id: "daytona-2025",
    scope: "Past notable",
    year: "2025",
    raceName: "Daytona 500",
    trackName: "Daytona International Speedway",
    date: "2025-02-16",
    title: "Late Daytona 500 chain reaction",
    status: "Collected",
    summary: "Joey Logano turned Stenhouse into Ryan Blaney late in the Daytona 500, setting off a multi-car crash near the front.",
    sourceLabel: "NASCAR video",
    sourceUrl: "https://www.nascar.com/videos/franchise/nascar-cup-series-highlights/huge-wreck-strikes-late-in-the-daytona-500-taking-out-several-big-names/",
    embedUrl: "https://www.youtube-nocookie.com/embed/WCEuqW-iHjI",
    thumbnail: "https://img.youtube.com/vi/WCEuqW-iHjI/hqdefault.jpg"
  },
  {
    id: "north-wilkesboro-2024",
    scope: "Past notable",
    year: "2024",
    raceName: "NASCAR All-Star Race",
    trackName: "North Wilkesboro Speedway",
    date: "2024-05-19",
    title: "Kyle Busch wrecks Stenhouse on Lap 2",
    status: "Accident",
    summary: "Stenhouse completed only two laps after Busch contact sent the No. 47 into the wall. The garage confrontation afterward became part of NASCAR lore.",
    sourceLabel: "NASCAR article",
    sourceUrl: "https://www.nascar.com/news-media/2024/05/19/ricky-stenhouse-jr-out-of-action-following-lap-2-wreck-in-all-star-race/",
    embedUrl: "https://www.youtube-nocookie.com/embed/Gl_yywYb0T8",
    thumbnail: "https://img.youtube.com/vi/Gl_yywYb0T8/hqdefault.jpg"
  },
  {
    id: "daytona-2018",
    scope: "Past notable",
    year: "2018",
    raceName: "Coke Zero Sugar 400",
    trackName: "Daytona International Speedway",
    date: "2018-07-07",
    title: "The original Wreckhouse night",
    status: "Involved in five crashes",
    summary: "NASCAR reported Stenhouse was involved in five of the race's eight crashes and triggered two multi-car incidents in Stage 2.",
    sourceLabel: "NASCAR article",
    sourceUrl: "https://www.nascar.com/news-media/2018/07/08/ricky-stenhouse-jr-multicar-wrecks-daytona/",
    embedUrl: "https://www.youtube-nocookie.com/embed/ZwCRfPoV5qw",
    thumbnail: "https://img.youtube.com/vi/ZwCRfPoV5qw/hqdefault.jpg"
  },
  {
    id: "talladega-2017",
    scope: "Past notable",
    year: "2017",
    raceName: "Alabama 500",
    trackName: "Talladega Superspeedway",
    date: "2017-10-15",
    title: "Playoff Talladega pileup",
    status: "Accident",
    summary: "A late multi-car incident collected Stenhouse after he had shown top-five speed at Talladega in the playoff round.",
    sourceLabel: "Speedway Media recap",
    sourceUrl: "https://speedwaymedia.com/2017/10/16/multi-car-incident-collects-stenhouse-jr-at-talladega-superspeedway/",
    embedUrl: "",
    thumbnail: "https://res.cloudinary.com/nascarnextgen/image/upload/c_fill,g_auto,w_768,h_432/q_auto/f_auto/v1/Hero_Heading_1_Photo_ickz3n"
  }
];

function cacheGet(key, ttlMs, loader) {
  const item = cache.get(key);
  const now = Date.now();
  if (item && now - item.time < ttlMs) {
    return item.value;
  }

  const value = Promise.resolve()
    .then(loader)
    .catch((error) => {
      cache.delete(key);
      throw error;
    });

  cache.set(key, { time: now, value });
  return value;
}

async function fetchText(url, timeoutMs = 9000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "accept": "application/json,text/markdown,text/plain,text/html,*/*",
        "user-agent": "StenhouseSuperfansLocal/1.0 (+local testing)"
      }
    });

    const text = await response.text();
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    if (/^\s*</.test(text) && !/^\s*<\?xml/.test(text)) {
      throw new Error("HTML response received");
    }

    return text;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchJson(url, timeoutMs = 9000) {
  const text = await fetchText(url, timeoutMs);
  if (/AccessDenied|Cloudflare|Attention Required/i.test(text)) {
    throw new Error("Feed access denied");
  }
  return JSON.parse(text);
}

async function getSchedule() {
  return cacheGet("schedule", 45_000, async () => {
    const url = `https://cf.nascar.com/cacher/${SEASON}/race_list_basic.json`;
    const data = await fetchJson(url);
    return data[`series_${CUP_SERIES_ID}`] || [];
  });
}

async function getWeekendFeed(raceId) {
  return cacheGet(`weekend:${raceId}`, 6_000, async () => {
    const url = `https://cf.nascar.com/cacher/${SEASON}/${CUP_SERIES_ID}/${raceId}/weekend-feed.json`;
    return fetchJson(url);
  });
}

async function getSeasonRaceRows() {
  return cacheGet("season-stenhouse-results", 30_000, async () => {
    const schedule = await getSchedule();
    const races = schedule
      .filter((race) => race.race_type_id === 1)
      .filter((race) => race.inspection_complete || new Date(race.date_scheduled || race.race_date).getTime() <= Date.now());

    const rows = [];
    for (const race of races) {
      try {
        const feed = await getWeekendFeed(race.race_id);
        const weekendRace = feed.weekend_race?.[0] || race;
        const row = findStenhouse(weekendRace.results || []);
        if (!row) continue;

        rows.push({
          raceId: race.race_id,
          raceName: weekendRace.race_name || race.race_name,
          trackName: weekendRace.track_name || race.track_name,
          date: weekendRace.date_scheduled || race.date_scheduled,
          start: row.starting_position || "",
          finish: row.finishing_position || "",
          status: row.finishing_status || "",
          lapsCompleted: row.laps_completed || 0,
          scheduledLaps: weekendRace.scheduled_laps || "",
          points: row.points_earned || 0,
          sponsor: row.sponsor || "",
          sourceUrl: `https://cf.nascar.com/cacher/${SEASON}/${CUP_SERIES_ID}/${race.race_id}/weekend-feed.json`
        });
      } catch (error) {
        rows.push({
          raceId: race.race_id,
          raceName: race.race_name,
          trackName: race.track_name,
          date: race.date_scheduled,
          status: "Feed unavailable",
          error: error.message
        });
      }
    }

    return rows;
  });
}

function isIncidentStatus(status) {
  return /accident|crash|dnf|damage|engine|garage|suspension|electrical|brakes|overheating/i.test(String(status || ""));
}

async function getWreckhouseDashboard() {
  const rows = await getSeasonRaceRows();
  const seasonIncidents = rows
    .filter((row) => isIncidentStatus(row.status))
    .map((row) => {
      const media = WRECK_MEDIA[row.raceId] || {};
      return {
        ...row,
        scope: "2026 season",
        year: String(SEASON),
        title: `${row.trackName} ${row.status}`,
        summary: row.status === "Accident"
          ? `Official race result lists Stenhouse as out by accident after ${row.lapsCompleted}/${row.scheduledLaps} laps.`
          : `Official race result status: ${row.status}.`,
        media
      };
    });

  return {
    generatedAt: new Date().toISOString(),
    driver: FALLBACK.driver,
    sources: [
      ...SOURCES,
      {
        label: "NASCAR 2026 EchoPark wreck video",
        url: WRECK_MEDIA[5597].url
      },
      {
        label: "NASCAR 2024 All-Star wreck article",
        url: "https://www.nascar.com/news-media/2024/05/19/ricky-stenhouse-jr-out-of-action-following-lap-2-wreck-in-all-star-race/"
      },
      {
        label: "NASCAR 2018 Daytona article",
        url: "https://www.nascar.com/news-media/2018/07/08/ricky-stenhouse-jr-multicar-wrecks-daytona/"
      }
    ],
    seasonRows: rows,
    seasonIncidents,
    notableWrecks: NOTABLE_WRECKS
  };
}

async function getLiveFeed(raceId) {
  return cacheGet(`live:${raceId}`, 2_500, async () => {
    const urls = [
      `https://cf.nascar.com/live/feeds/series_${CUP_SERIES_ID}/${raceId}/live_feed.json`,
      `https://www.nascar.com/live/feeds/series_${CUP_SERIES_ID}/${raceId}/live_feed.json`
    ];

    const errors = [];
    for (const url of urls) {
      try {
        return await fetchJson(url, 3200);
      } catch (error) {
        errors.push(`${url}: ${error.message}`);
      }
    }

    throw new Error(errors.join(" | "));
  });
}

async function getDriverMarkdown() {
  return cacheGet("driver-markdown", 60_000, async () => {
    const readerUrl = "https://r.jina.ai/http://https://www.nascar.com/drivers/ricky-stenhouse-jr";
    return fetchText(readerUrl, 15_000);
  });
}

function cleanLines(text) {
  return String(text)
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function metricFromLines(lines, label) {
  const index = lines.findIndex((line) => line.toUpperCase() === label);
  if (index === -1) return "";
  return lines[index + 1] || "";
}

function parseDriverMarkdown(markdown) {
  const lines = cleanLines(markdown);
  const summaryStart = lines.findIndex((line) => line.startsWith("2026 SEASON"));
  const highlightsIndex = lines.findIndex((line) => line === "CAREER HIGHLIGHTS");
  const summaryLines = summaryStart >= 0 && highlightsIndex > summaryStart
    ? lines.slice(summaryStart, highlightsIndex)
    : lines;

  const season = {
    year: 2026,
    rank: metricFromLines(summaryLines, "DRIVER RANK"),
    points: metricFromLines(summaryLines, "POINTS"),
    pointsBehind: metricFromLines(summaryLines, "POINTS BEHIND"),
    races: metricFromLines(summaryLines, "RACES"),
    wins: metricFromLines(summaryLines, "WINS"),
    top10: metricFromLines(summaryLines, "TOP 10'S"),
    top5: metricFromLines(summaryLines, "TOP 5'S"),
    poles: metricFromLines(summaryLines, "POLES"),
    dnf: metricFromLines(summaryLines, "DNF"),
    lapsLed: metricFromLines(summaryLines, "LAPS LED"),
    avgStart: metricFromLines(summaryLines, "AVG. START"),
    avgFinish: metricFromLines(summaryLines, "AVG. FINISH")
  };

  const driver = {
    ...FALLBACK.driver,
    dateOfBirth: metricFromLines(lines, "DATE OF BIRTH") || FALLBACK.driver.dateOfBirth,
    hometown: metricFromLines(lines, "HOMETOWN") || FALLBACK.driver.hometown,
    crewChief: metricFromLines(lines, "CREW CHIEF") || FALLBACK.driver.crewChief,
    team: metricFromLines(lines, "TEAM") || FALLBACK.driver.team
  };

  return {
    driver,
    season: { ...FALLBACK.season, ...blankless(season) },
    raceLog: parseRaceLog(lines),
    annualHistory: parseAnnualHistory(lines),
    careerHighlights: FALLBACK.careerHighlights
  };
}

function blankless(object) {
  return Object.fromEntries(Object.entries(object).filter(([, value]) => value !== ""));
}

function parseRaceLog(lines) {
  const start = lines.findIndex((line) => line === "TRACK");
  const end = lines.findIndex((line, index) => index > start && line === "YEAR");
  if (start === -1 || end === -1) return FALLBACK.raceLog;

  const headers = new Set(["TRACK", "STARTING POSITION", "FINISHING POSITION", "START", "FINISH", "POINTS"]);
  const values = lines.slice(start, end).filter((line) => !headers.has(line));
  const rows = [];

  for (let i = 0; i <= values.length - 4; i += 4) {
    rows.push({
      track: values[i],
      start: values[i + 1],
      finish: values[i + 2],
      points: values[i + 3]
    });
  }

  return rows.length ? rows : FALLBACK.raceLog;
}

function parseAnnualHistory(lines) {
  const yearIndex = lines.findIndex((line) => line === "YEAR");
  if (yearIndex === -1) return FALLBACK.annualHistory;

  const headerEnd = lines.findIndex((line, index) => index > yearIndex && line === "AVG. FINISH");
  if (headerEnd === -1) return FALLBACK.annualHistory;

  const numeric = lines
    .slice(headerEnd + 1)
    .filter((line) => /^-?\d+(\.\d+)?$/.test(line));

  const rows = [];
  for (let i = 0; i <= numeric.length - 9; i += 9) {
    rows.push({
      year: numeric[i],
      rank: numeric[i + 1],
      wins: numeric[i + 2],
      top5: numeric[i + 3],
      top10: numeric[i + 4],
      poles: numeric[i + 5],
      lapsLed: numeric[i + 6],
      avgStart: numeric[i + 7],
      avgFinish: numeric[i + 8]
    });
  }

  return rows.length ? rows.slice(0, 14) : FALLBACK.annualHistory;
}

function selectRace(races) {
  if (!races.length) return null;

  const now = Date.now();
  const sorted = races
    .filter((race) => race.race_type_id === 1)
    .sort((a, b) => new Date(a.date_scheduled) - new Date(b.date_scheduled));

  const activeWindow = sorted.find((race) => {
    const start = new Date(race.date_scheduled || race.race_date).getTime();
    return !race.inspection_complete && now >= start - 36 * 60 * 60 * 1000 && now <= start + 72 * 60 * 60 * 1000;
  });
  if (activeWindow) return activeWindow;

  const upcoming = sorted.find((race) => {
    const start = new Date(race.date_scheduled || race.race_date).getTime();
    return start >= now && !race.inspection_complete;
  });
  if (upcoming) return upcoming;

  const completed = [...sorted].reverse().find((race) => new Date(race.date_scheduled || race.race_date).getTime() <= now);
  return completed || sorted[0];
}

function findStenhouse(results) {
  return (results || []).find((entry) => {
    const id = entry.driver_id || entry.driver?.driver_id;
    const name = entry.driver_fullname || entry.driver?.full_name || "";
    const number = entry.car_number || entry.vehicle_number || entry.official_car_number || "";
    return id === DRIVER_ID || /Stenhouse/i.test(name) || String(number) === "47";
  });
}

function sumLapsLed(lapsLed) {
  if (Array.isArray(lapsLed)) {
    return lapsLed.reduce((total, segment) => {
      const start = Number(segment.start_lap || 0);
      const end = Number(segment.end_lap || 0);
      return total + Math.max(0, end - start + 1);
    }, 0);
  }
  return Number(lapsLed || 0);
}

function flagLabel(code) {
  const labels = {
    0: "Not live",
    1: "Green",
    2: "Yellow",
    3: "Red",
    4: "Checkered",
    6: "Stopped",
    8: "Warmup",
    9: "Non-live"
  };
  return labels[code] || "Race control";
}

function statusLabel(code) {
  const labels = {
    0: "Not started",
    1: "Running",
    2: "In pit",
    3: "Out",
    4: "Garage",
    5: "Finished"
  };
  return labels[code] || "";
}

function formatDuration(seconds) {
  const value = Number(seconds || 0);
  if (!Number.isFinite(value) || value <= 0) return "";
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const secs = Math.floor(value % 60);
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    : `${minutes}:${String(secs).padStart(2, "0")}`;
}

function normalizeField(liveFeed, weekendRace) {
  if (liveFeed?.vehicles?.length) {
    return [...liveFeed.vehicles]
      .sort((a, b) => Number(a.running_position || 999) - Number(b.running_position || 999))
      .map((entry) => ({
        position: entry.running_position || "",
        carNumber: entry.vehicle_number || "",
        driver: entry.driver?.full_name || "",
        manufacturer: entry.vehicle_manufacturer || "",
        sponsor: entry.sponsor_name || "",
        delta: entry.delta === 0 ? "Leader" : entry.delta,
        laps: entry.laps_completed || 0,
        lastLap: entry.last_lap_time || "",
        bestLap: entry.best_lap_time || "",
        isStenhouse: entry.driver?.driver_id === DRIVER_ID
      }));
  }

  const results = weekendRace?.results || [];
  const isComplete = results.some((entry) => Number(entry.finishing_position) > 0);
  return [...results]
    .sort((a, b) => {
      const aPos = isComplete ? a.finishing_position : a.starting_position;
      const bPos = isComplete ? b.finishing_position : b.starting_position;
      return Number(aPos || 999) - Number(bPos || 999);
    })
    .map((entry) => ({
      position: isComplete ? entry.finishing_position : entry.starting_position,
      carNumber: entry.car_number || entry.official_car_number || "",
      driver: entry.driver_fullname || "",
      manufacturer: entry.car_make || "",
      sponsor: entry.sponsor || "",
      delta: isComplete && entry.diff_time ? entry.diff_time : "",
      laps: entry.laps_completed || 0,
      lastLap: "",
      bestLap: "",
      isStenhouse: entry.driver_id === DRIVER_ID
    }));
}

function normalizeRace(race, weekendFeed, liveFeed, errors) {
  const weekendRace = weekendFeed?.weekend_race?.[0] || race || {};
  const weekendResults = weekendRace.results || [];
  const weekendStenhouse = findStenhouse(weekendResults);
  const liveStenhouse = findStenhouse(liveFeed?.vehicles);
  const current = liveStenhouse || weekendStenhouse || {};
  const field = normalizeField(liveFeed, weekendRace);

  const position = current.running_position || current.finishing_position || "";
  const start = current.starting_position || "";
  const status = liveFeed
    ? "live"
    : weekendRace.inspection_complete || weekendRace.winner_driver_id
      ? "complete"
      : "pre-race";

  const lastPit = Array.isArray(current.pit_stops)
    ? current.pit_stops.filter((stop) => Number(stop.pit_in_lap_count) > 0).slice(-1)[0]
    : null;

  return {
    status,
    sourceMode: liveFeed ? "NASCAR live feed" : "NASCAR weekend feed",
    raceId: weekendRace.race_id || race?.race_id || "",
    raceName: weekendRace.race_name || race?.race_name || "",
    trackName: weekendRace.track_name || race?.track_name || "",
    scheduled: weekendRace.date_scheduled || race?.date_scheduled || "",
    scheduledLaps: liveFeed?.laps_in_race || weekendRace.scheduled_laps || "",
    currentLap: liveFeed?.lap_number || 0,
    lapsToGo: liveFeed?.laps_to_go || "",
    stage: liveFeed?.stage || "",
    flagState: liveFeed?.flag_state ?? 9,
    flagLabel: liveFeed ? flagLabel(liveFeed.flag_state) : "Not live",
    elapsed: formatDuration(liveFeed?.elapsed_time),
    cautions: liveFeed?.number_of_caution_segments ?? weekendRace.number_of_cautions ?? 0,
    cautionLaps: liveFeed?.number_of_caution_laps ?? weekendRace.number_of_caution_laps ?? 0,
    leadChanges: liveFeed?.number_of_lead_changes ?? weekendRace.number_of_lead_changes ?? 0,
    leaders: liveFeed?.number_of_leaders ?? weekendRace.number_of_leaders ?? 0,
    tv: weekendRace.television_broadcaster || "",
    radio: weekendRace.radio_broadcaster || "",
    satelliteRadio: weekendRace.satellite_radio_broadcaster || "",
    stenhouse: {
      position,
      start,
      positionDelta: position && start ? Number(start) - Number(position) : "",
      status: statusLabel(current.status) || current.finishing_status || "",
      carNumber: current.vehicle_number || current.car_number || "47",
      sponsor: current.sponsor_name || current.sponsor || FALLBACK.driver.sponsor,
      manufacturer: current.vehicle_manufacturer || current.car_make || FALLBACK.driver.manufacturer,
      lapsCompleted: current.laps_completed || 0,
      lapsLed: sumLapsLed(current.laps_led),
      lastLapTime: current.last_lap_time || "",
      lastLapSpeed: current.last_lap_speed || "",
      bestLapTime: current.best_lap_time || "",
      bestLapSpeed: current.best_lap_speed || "",
      avgRunningPosition: current.average_running_position || "",
      avgSpeed: current.average_speed || "",
      passesMade: current.passes_made || "",
      passingDifferential: current.passing_differential || "",
      fastestLapsRun: current.fastest_laps_run || "",
      isOnTrack: current.is_on_track ?? "",
      lastPit: lastPit ? {
        lap: lastPit.pit_in_lap_count,
        duration: lastPit.pit_stop_duration,
        type: lastPit.pit_stop_type
      } : null
    },
    field,
    topTen: field.slice(0, 10),
    stenhouseRow: field.find((entry) => entry.isStenhouse) || null,
    errors
  };
}

async function getRaceDashboard() {
  const errors = [];
  let selectedRace = null;
  let schedule = [];
  let weekendFeed = null;
  let liveFeed = null;

  try {
    schedule = await getSchedule();
    selectedRace = selectRace(schedule);
  } catch (error) {
    errors.push(`Schedule: ${error.message}`);
    selectedRace = {
      race_id: 5605,
      race_name: "Jack Link's 500",
      track_name: "Talladega Superspeedway",
      date_scheduled: "2026-04-26T15:00:00",
      scheduled_laps: 188
    };
  }

  if (selectedRace?.race_id) {
    try {
      weekendFeed = await getWeekendFeed(selectedRace.race_id);
    } catch (error) {
      errors.push(`Weekend feed: ${error.message}`);
    }

    try {
      liveFeed = await getLiveFeed(selectedRace.race_id);
    } catch (error) {
      errors.push(`Live feed: ${error.message}`);
    }
  }

  return normalizeRace(selectedRace, weekendFeed, liveFeed, errors);
}

async function getDriverDashboard() {
  try {
    const markdown = await getDriverMarkdown();
    return parseDriverMarkdown(markdown);
  } catch (error) {
    return {
      driver: FALLBACK.driver,
      season: FALLBACK.season,
      raceLog: FALLBACK.raceLog,
      annualHistory: FALLBACK.annualHistory,
      careerHighlights: FALLBACK.careerHighlights,
      error: error.message
    };
  }
}

async function buildDashboard() {
  const [driverData, currentRace] = await Promise.all([
    getDriverDashboard(),
    getRaceDashboard()
  ]);

  const warnings = [];
  if (driverData.error) warnings.push(`Driver stats fallback: ${driverData.error}`);
  if (currentRace.errors?.length) warnings.push(...currentRace.errors);

  return {
    generatedAt: new Date().toISOString(),
    assets: ASSETS,
    sources: SOURCES,
    warnings,
    ...driverData,
    currentRace
  };
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, JSON_HEADERS);
  response.end(JSON.stringify(payload));
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".ico": "image/x-icon"
  }[ext] || "application/octet-stream";
}

function serveStatic(requestUrl, response) {
  const url = new URL(requestUrl, `http://${HOST}:${PORT}`);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === "/") pathname = "/index.html";

  const filePath = path.normalize(path.join(PUBLIC_DIR, pathname));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }
    response.writeHead(200, {
      "content-type": contentType(filePath),
      "cache-control": "no-cache"
    });
    response.end(data);
  });
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${HOST}:${PORT}`);

    if (url.pathname === "/api/health") {
      sendJson(response, 200, { ok: true, generatedAt: new Date().toISOString() });
      return;
    }

    if (url.pathname === "/api/dashboard") {
      const dashboard = await buildDashboard();
      sendJson(response, 200, dashboard);
      return;
    }

    if (url.pathname === "/api/wreckhouse") {
      const wreckhouse = await getWreckhouseDashboard();
      sendJson(response, 200, wreckhouse);
      return;
    }

    serveStatic(request.url, response);
  } catch (error) {
    sendJson(response, 500, {
      ok: false,
      error: error.message
    });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Stenhouse Superfans dashboard running at http://${HOST}:${PORT}`);
  console.log("Press Ctrl+C to stop.");
});
