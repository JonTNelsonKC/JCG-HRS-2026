const ENV = globalThis.process?.env || {};
const CURRENT_YEAR = new Date().getFullYear();
const MIN_SEASON_YEAR = 2000;
const MAX_SEASON_YEAR = CURRENT_YEAR + 1;

function configuredSeasonYear() {
  const raw = ENV.SEASON;
  if (raw === undefined || raw === null || raw === "") return CURRENT_YEAR;

  const parsed = Number.parseInt(String(raw), 10);
  if (!Number.isFinite(parsed)) return CURRENT_YEAR;
  if (parsed < MIN_SEASON_YEAR || parsed > MAX_SEASON_YEAR) return CURRENT_YEAR;
  return parsed;
}

const SEASON = configuredSeasonYear();
const CUP_SERIES_ID = 1;
const DRIVER_ID = 3888;
const DRIVER_NAME = "Ricky Stenhouse Jr.";
const STAT_ROLLOVER_TIME_ZONE = ENV.STAT_ROLLOVER_TIME_ZONE || "America/New_York";
const WEEKDAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

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

const SECONDARY_SOURCES = [
  {
    label: "FOX Sports race leaderboard",
    url: "https://www.foxsports.com/nascar/raceTrax?tab=leaderboard"
  }
];

const NEWS_LINKS = [
  {
    category: "General NASCAR",
    emphasis: "Race news",
    title: "Running recap: Talladega spring race",
    source: "NASCAR.com",
    date: "2026-04-26",
    url: "https://www.nascar.com/news-media/2026/04/26/cup-series-2026-talladega-spring-race-recap/",
    summary: "Live-style race recap from the Jack Link's 500 at Talladega."
  },
  {
    category: "General NASCAR",
    emphasis: "Race news",
    title: "Big One strikes Talladega at Lap 115",
    source: "NASCAR.com",
    date: "2026-04-26",
    url: "https://www.nascar.com/news-media/2026/04/26/cup-series-big-one-strikes-talladega-spring-bubba-wallace-involved/",
    summary: "Official NASCAR story on the large Talladega crash and affected contenders."
  },
  {
    category: "General NASCAR",
    emphasis: "Race preview",
    title: "What to Watch: 2026 Talladega spring race",
    source: "NASCAR.com",
    date: "2026-04-25",
    url: "https://www.nascar.com/news-media/2026/04/25/cup-series-2026-talladega-what-to-watch-jack-links-500-preview/",
    summary: "Race-day essentials, stage format notes, TV/radio details and strategy angles."
  },
  {
    category: "Ricky Stenhouse Jr.",
    emphasis: "Race news",
    title: "Racing Insights: Projected results for Talladega",
    source: "NASCAR.com",
    date: "2026-04-25",
    url: "https://www.nascar.com/news-media/2026/04/25/racing-insights-2026-talladega-spring-projected-results/",
    summary: "Includes Stenhouse as a superspeedway threat after his Daytona runner-up."
  },
  {
    category: "Ricky Stenhouse Jr.",
    emphasis: "Team news",
    title: "2026 season preview: Hyak Motorsports",
    source: "NASCAR.com",
    date: "2026-01-16",
    url: "https://www.nascar.com/news-media/2026/01/16/2026-season-preview-hyak-motorsports/",
    summary: "NASCAR's season outlook for HYAK Motorsports and the No. 47 team."
  },
  {
    category: "Ricky Stenhouse Jr.",
    emphasis: "Race news",
    title: "Stenhouse Jr. to make Truck Series debut with Niece",
    source: "NASCAR.com",
    date: "2026-01-14",
    url: "https://www.nascar.com/news-media/2026/01/14/ricky-stenhouse-jr-craftsman-truck-series-debut-niece-motorsports/",
    summary: "Stenhouse adds Daytona and EchoPark Truck starts to his 2026 racing calendar."
  },
  {
    category: "Ricky Stenhouse Jr.",
    emphasis: "Team news",
    title: "Chef Boyardee joins HYAK Motorsports",
    source: "HYAK Motorsports",
    date: "2026-01-12",
    url: "https://www.hyakmotorsports.com/news/2026/january/12/news-hyak-motorsports-announces-multi-race-sponsorship-with-chef-boyardee",
    summary: "Public team release on Ricky's Chef Boyardee No. 47 sponsorship."
  },
  {
    category: "Ricky Stenhouse Jr.",
    emphasis: "Race result",
    title: "Stenhouse runner-up in 2026 Daytona 500",
    source: "RotoBaller",
    date: "2026-02-16",
    url: "https://www.rotoballer.com/player-news/ricky-stenhouse-jr-finishes-as-the-runner-up-in-the-daytona-500/1814446",
    summary: "Secondary public write-up on Stenhouse's second-place Daytona 500 finish."
  },
  {
    category: "General NASCAR",
    emphasis: "News hub",
    title: "NASCAR News & Media",
    source: "NASCAR.com",
    date: "",
    url: "https://www.nascar.com/news-media/",
    summary: "Official public NASCAR news hub for the latest series-wide updates."
  },
  {
    category: "Ricky Stenhouse Jr.",
    emphasis: "Driver hub",
    title: "Ricky Stenhouse Jr. driver page",
    source: "NASCAR.com",
    date: "",
    url: "https://www.nascar.com/drivers/ricky-stenhouse-jr",
    summary: "Official driver profile with stats, bio and current-season performance."
  }
];

function raceSlug(input) {
  return String(input || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function dashboardSources(currentRace) {
  const raceSlugValue = raceSlug(currentRace?.raceName);
  const raceSources = raceSlugValue
    ? [{
        label: "NASCAR live leaderboard",
        url: `https://www.nascar.com/live-results/nascar-cup-series/${SEASON}-${raceSlugValue}/`
      }]
    : [];

  return [
    ...SOURCES,
    ...raceSources,
    ...SECONDARY_SOURCES
  ];
}

function newsSources() {
  return [
    {
      label: "NASCAR News & Media",
      url: "https://www.nascar.com/news-media/"
    },
    {
      label: "NASCAR Stenhouse profile",
      url: FALLBACK.driver.officialPage
    },
    {
      label: "HYAK Motorsports news",
      url: "https://www.hyakmotorsports.com/news"
    }
  ];
}

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

function timeoutSignal(timeoutMs) {
  if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
    return AbortSignal.timeout(timeoutMs);
  }

  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
}

async function fetchText(url, timeoutMs = 9000) {
  const response = await fetch(url, {
    signal: timeoutSignal(timeoutMs),
    headers: {
      accept: "application/json,text/markdown,text/plain,text/html,*/*"
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
}

async function fetchJson(url, timeoutMs = 9000) {
  const text = await fetchText(url, timeoutMs);
  if (/AccessDenied|Cloudflare|Attention Required/i.test(text)) {
    throw new Error("Feed access denied");
  }
  return JSON.parse(text);
}

function truthyRaceFlag(value) {
  if (value === true || value === 1) return true;
  if (value === false || value === 0 || value === null || value === undefined) return false;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return false;
    if (["1", "true", "yes", "y", "complete", "completed", "final"].includes(normalized)) return true;
    if (["0", "false", "no", "n", "pending", "incomplete", "scheduled"].includes(normalized)) return false;
  }
  return Boolean(value);
}

function isInspectionComplete(raceLike) {
  return truthyRaceFlag(raceLike?.inspection_complete);
}

function hasWinnerId(value) {
  const numeric = Number(value);
  if (Number.isFinite(numeric)) return numeric > 0;
  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized !== "" && normalized !== "0";
  }
  return Boolean(value);
}

async function getScheduleForSeason(season = SEASON) {
  return cacheGet(`schedule:${season}`, 45_000, async () => {
    const url = `https://cf.nascar.com/cacher/${season}/race_list_basic.json`;
    const data = await fetchJson(url);
    return data[`series_${CUP_SERIES_ID}`] || [];
  });
}

async function getSchedule() {
  return getScheduleForSeason(SEASON);
}

async function getWeekendFeedForSeason(season, raceId) {
  return cacheGet(`weekend:${season}:${raceId}`, 6_000, async () => {
    const url = `https://cf.nascar.com/cacher/${season}/${CUP_SERIES_ID}/${raceId}/weekend-feed.json`;
    return fetchJson(url);
  });
}

async function getWeekendFeed(raceId) {
  return getWeekendFeedForSeason(SEASON, raceId);
}

async function getSeasonRaceRows() {
  return cacheGet("season-stenhouse-results", 30_000, async () => {
    const schedule = await getSchedule();
    const races = schedule
      .filter((race) => race.race_type_id === 1)
      .filter((race) => {
        const start = new Date(race.date_scheduled || race.race_date).getTime();
        return isInspectionComplete(race) || Number.isFinite(start) && start <= Date.now();
      });

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

export async function getWreckhouseDashboard() {
  const warnings = [];
  let rows = [];

  try {
    rows = await getSeasonRaceRows();
  } catch (error) {
    warnings.push(`Season wreck feed fallback: ${error.message}`);
  }

  const seasonIncidents = rows
    .filter((row) => isIncidentStatus(row.status))
    .map((row) => {
      const media = WRECK_MEDIA[row.raceId] || {};
      return {
        ...row,
        scope: `${SEASON} season`,
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
    warnings,
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
      },
      {
        label: "Speedway Media 2017 Talladega recap",
        url: "https://speedwaymedia.com/2017/10/16/multi-car-incident-collects-stenhouse-jr-at-talladega-superspeedway/"
      }
    ],
    seasonRows: rows,
    seasonIncidents,
    notableWrecks: NOTABLE_WRECKS
  };
}

function raceDate(race) {
  return race?.date_scheduled || race?.race_date || "";
}

function utcTime(input) {
  if (!input) return "";
  return /z$|[+-]\d\d:?\d\d$/i.test(String(input)) ? input : `${input}Z`;
}

function raceTime(race) {
  const event = Array.isArray(race?.schedule)
    ? race.schedule.find((item) => item.run_type === 3)
    : null;
  return event?.start_time_utc ? utcTime(event.start_time_utc) : raceDate(race);
}

function datePartsInTimeZone(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);

  return Object.fromEntries(parts
    .filter((part) => part.type !== "literal")
    .map((part) => [part.type, part.value]));
}

function zonedTimeToUtcMs(dateParts, timeZone) {
  const target = Date.UTC(
    Number(dateParts.year),
    Number(dateParts.month) - 1,
    Number(dateParts.day),
    Number(dateParts.hour || 0),
    Number(dateParts.minute || 0),
    Number(dateParts.second || 0)
  );
  let guess = target;

  for (let index = 0; index < 3; index += 1) {
    const currentParts = datePartsInTimeZone(new Date(guess), timeZone);
    const current = Date.UTC(
      Number(currentParts.year),
      Number(currentParts.month) - 1,
      Number(currentParts.day),
      Number(currentParts.hour),
      Number(currentParts.minute),
      Number(currentParts.second)
    );
    guess += target - current;
  }

  return guess;
}

function statsRolloverMs(raceDateInput) {
  const start = new Date(raceDateInput);
  if (Number.isNaN(start.getTime())) return Number.POSITIVE_INFINITY;

  const parts = datePartsInTimeZone(start, STAT_ROLLOVER_TIME_ZONE);
  const weekday = WEEKDAY_INDEX[parts.weekday] ?? 0;
  const daysUntilTuesday = (9 - weekday) % 7 || 7;
  const rolloverLocalDate = new Date(Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day) + daysUntilTuesday
  ));

  return zonedTimeToUtcMs({
    year: rolloverLocalDate.getUTCFullYear(),
    month: rolloverLocalDate.getUTCMonth() + 1,
    day: rolloverLocalDate.getUTCDate()
  }, STAT_ROLLOVER_TIME_ZONE);
}

function publicLiveResultsUrl(season, raceName) {
  const slug = raceSlug(raceName);
  return slug ? `https://www.nascar.com/live-results/nascar-cup-series/${season}-${slug}/` : "https://www.nascar.com/live-results/nascar-cup-series/";
}

function stageLaps(race) {
  return [1, 2, 3, 4]
    .map((stageNumber) => numberOrZero(race?.[`stage_${stageNumber}_laps`]))
    .filter((laps) => laps > 0);
}

function trackKey(trackId, trackName) {
  return String(trackId || raceSlug(trackName));
}

async function getPreviousTrackResults(trackId, trackName) {
  const previousSeason = SEASON - 1;
  const key = trackKey(trackId, trackName);
  return cacheGet(`previous-track:${previousSeason}:${key}`, 60 * 60_000, async () => {
    const previousSchedule = await getScheduleForSeason(previousSeason);
    const matches = previousSchedule
      .filter((race) => race.race_type_id === 1)
      .filter((race) => String(race.track_id || "") === String(trackId || "") || raceSlug(race.track_name) === raceSlug(trackName))
      .sort((a, b) => new Date(raceDate(a)) - new Date(raceDate(b)));

    const results = [];
    for (const race of matches) {
      try {
        const feed = await getWeekendFeedForSeason(previousSeason, race.race_id);
        const weekendRace = feed.weekend_race?.[0] || race;
        const row = findStenhouse(weekendRace.results || []);
        if (!row) continue;

        results.push({
          season: previousSeason,
          raceId: race.race_id,
          raceName: weekendRace.race_name || race.race_name,
          trackName: weekendRace.track_name || race.track_name,
          date: raceDate(weekendRace) || raceDate(race),
          start: row.starting_position || "",
          finish: row.finishing_position || "",
          status: row.finishing_status || "",
          lapsCompleted: row.laps_completed || 0,
          scheduledLaps: weekendRace.scheduled_laps || "",
          points: row.points_earned || "",
          sourceUrl: `https://cf.nascar.com/cacher/${previousSeason}/${CUP_SERIES_ID}/${race.race_id}/weekend-feed.json`
        });
      } catch (error) {
        results.push({
          season: previousSeason,
          raceId: race.race_id,
          raceName: race.race_name,
          trackName: race.track_name,
          date: raceDate(race),
          status: "Previous result unavailable",
          error: error.message,
          sourceUrl: `https://cf.nascar.com/cacher/${previousSeason}/${CUP_SERIES_ID}/${race.race_id}/weekend-feed.json`
        });
      }
    }

    return results;
  });
}

export async function getScheduleDashboard() {
  const warnings = [];
  let schedule = [];

  try {
    schedule = await getScheduleForSeason(SEASON);
  } catch (error) {
    warnings.push(`Schedule feed unavailable: ${error.message}`);
  }

  const now = Date.now();
  const futureRaces = schedule
    .filter((race) => race.race_type_id === 1)
    .filter((race) => {
      const start = new Date(raceTime(race)).getTime();
      return Number.isFinite(start) && start > now && !isInspectionComplete(race);
    })
    .sort((a, b) => new Date(raceTime(a)) - new Date(raceTime(b)));

  const races = await Promise.all(futureRaces.map(async (race) => {
    let previousResults = [];
    try {
      previousResults = await getPreviousTrackResults(race.track_id, race.track_name);
    } catch (error) {
      warnings.push(`${race.track_name} ${SEASON - 1} lookup: ${error.message}`);
    }

    return {
      raceId: race.race_id,
      raceName: race.race_name,
      trackName: race.track_name,
      date: raceDate(race),
      raceTime: raceTime(race),
      laps: race.scheduled_laps || "",
      distance: race.scheduled_distance || "",
      stages: stageLaps(race),
      tv: race.television_broadcaster || "",
      radio: race.radio_broadcaster || "",
      satelliteRadio: race.satellite_radio_broadcaster || "",
      playoffRound: race.playoff_round || 0,
      sourceUrl: publicLiveResultsUrl(SEASON, race.race_name),
      previousSeason: SEASON - 1,
      previousResults
    };
  }));

  return {
    generatedAt: new Date().toISOString(),
    season: SEASON,
    previousSeason: SEASON - 1,
    warnings,
    races,
    sources: [
      {
        label: "NASCAR current season schedule feed",
        url: `https://cf.nascar.com/cacher/${SEASON}/race_list_basic.json`
      },
      {
        label: "NASCAR previous season schedule feed",
        url: `https://cf.nascar.com/cacher/${SEASON - 1}/race_list_basic.json`
      },
      {
        label: "NASCAR Stenhouse driver stats",
        url: FALLBACK.driver.officialPage
      },
      {
        label: "FOX Sports Cup schedule",
        url: "https://www.foxsports.com/nascar/cup-series/schedule"
      }
    ]
  };
}

export async function getNewsDashboard() {
  return {
    generatedAt: new Date().toISOString(),
    season: SEASON,
    driver: FALLBACK.driver,
    links: NEWS_LINKS,
    sources: newsSources()
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
  const summaryStart = lines.findIndex((line) => line.startsWith(`${SEASON} SEASON`));
  const highlightsIndex = lines.findIndex((line) => line === "CAREER HIGHLIGHTS");
  const summaryLines = summaryStart >= 0 && highlightsIndex > summaryStart
    ? lines.slice(summaryStart, highlightsIndex)
    : lines;

  const season = {
    year: SEASON,
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
    const rollover = statsRolloverMs(race.date_scheduled || race.race_date);
    return !isInspectionComplete(race)
      && Number.isFinite(start)
      && now >= start - 36 * 60 * 60 * 1000
      && now < rollover;
  });
  if (activeWindow) return activeWindow;

  const upcoming = sorted.find((race) => {
    const start = new Date(race.date_scheduled || race.race_date).getTime();
    return start >= now && !isInspectionComplete(race);
  });
  if (upcoming) return upcoming;

  const nearestFuture = sorted.find((race) => {
    const start = new Date(race.date_scheduled || race.race_date).getTime();
    return Number.isFinite(start) && start >= now;
  });
  if (nearestFuture) return nearestFuture;

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

function normalizedRaceLapsValue(weekendRace, liveFeed) {
  const weekendScheduled = Number(weekendRace?.scheduled_laps);
  const weekendActual = Number(weekendRace?.actual_laps);
  const liveRaceLaps = Number(liveFeed?.laps_in_race);

  const scheduled = Number.isFinite(weekendScheduled) && weekendScheduled > 0 ? weekendScheduled : 0;
  const actual = Number.isFinite(weekendActual) && weekendActual > 0 ? weekendActual : 0;
  const official = actual || scheduled;

  if (!Number.isFinite(liveRaceLaps) || liveRaceLaps <= 0) return official;
  if (!official) return liveRaceLaps;

  const maxDrift = Math.max(10, Math.ceil(official * 0.1));
  return Math.abs(liveRaceLaps - official) > maxDrift ? official : liveRaceLaps;
}

function isCompleteRaceFeed(weekendRace, liveFeed) {
  if (isInspectionComplete(weekendRace) || hasWinnerId(weekendRace?.winner_driver_id)) return true;
  if (!liveFeed) return false;

  const flagState = Number(liveFeed.flag_state);
  const rawLapsToGo = liveFeed.laps_to_go;
  const lapsToGo = Number(rawLapsToGo);
  const currentLap = Number(liveFeed.lap_number);
  const raceLaps = normalizedRaceLapsValue(weekendRace, liveFeed);
  const lapsToGoKnown = rawLapsToGo !== "" && rawLapsToGo !== null && rawLapsToGo !== undefined;

  return flagState === 4
    || Number.isFinite(currentLap)
      && Number.isFinite(raceLaps)
      && currentLap >= raceLaps
      && (!lapsToGoKnown || Number.isFinite(lapsToGo) && lapsToGo <= 0);
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

function numberOrZero(input) {
  const numeric = Number(input);
  return Number.isFinite(numeric) ? numeric : 0;
}

function hasStartingLineup(weekendRace) {
  const rows = Array.isArray(weekendRace?.results) ? weekendRace.results : [];
  const maxStartingSpot = Math.max(rows.length, 40);
  const stenhouseStart = numberOrZero(findStenhouse(rows)?.starting_position);
  const startingRows = rows.filter((row) => {
    const start = numberOrZero(row.starting_position);
    return start > 0 && start <= maxStartingSpot;
  });
  const minimumLineupRows = Math.min(20, rows.length || 20);

  return stenhouseStart > 0
    && stenhouseStart <= maxStartingSpot
    && startingRows.length >= minimumLineupRows;
}

function resultStageNumber(row) {
  return numberOrZero(row.stage_number || row.stage_num || row.stage || row.race_stage);
}

function resultFinishPosition(row) {
  return numberOrZero(row.finishing_position || row.finish_position || row.stage_finish || row.position || row.running_position);
}

function getRickyStageResults(weekendRace) {
  const rows = Array.isArray(weekendRace?.stage_results) ? weekendRace.stage_results : [];
  return rows
    .filter((row) => {
      const id = row.driver_id || row.driver?.driver_id;
      const name = row.driver_fullname || row.driver_name || row.driver?.full_name || "";
      const number = row.car_number || row.vehicle_number || row.official_car_number || "";
      return id === DRIVER_ID || /Stenhouse/i.test(name) || String(number) === "47";
    })
    .reduce((results, row) => {
      const stageNumber = resultStageNumber(row);
      const finishPosition = resultFinishPosition(row);
      if (stageNumber && finishPosition) results[stageNumber] = finishPosition;
      return results;
    }, {});
}

function buildStagePlan(weekendRace, liveFeed, currentLap, current) {
  const scheduledLaps = numberOrZero(normalizedRaceLapsValue(weekendRace, liveFeed));
  const rickyStageResults = getRickyStageResults(weekendRace);
  const rawStages = [1, 2, 3, 4]
    .map((stageNumber) => ({
      stageNumber,
      laps: numberOrZero(weekendRace?.[`stage_${stageNumber}_laps`])
    }))
    .filter((stage) => stage.laps > 0);

  let stageEnds = [];
  if (rawStages.length) {
    const rawValues = rawStages.map((stage) => stage.laps);
    const sum = rawValues.reduce((total, laps) => total + laps, 0);
    const isIncreasing = rawValues.every((laps, index) => index === 0 || laps > rawValues[index - 1]);
    const looksCumulative = scheduledLaps > 0 && isIncreasing && rawValues.at(-1) === scheduledLaps && sum !== scheduledLaps;

    if (looksCumulative) {
      stageEnds = rawStages.map((stage) => ({
        stageNumber: stage.stageNumber,
        endLap: stage.laps
      }));
    } else {
      let lapTotal = 0;
      stageEnds = rawStages.map((stage) => {
        lapTotal += stage.laps;
        return {
          stageNumber: stage.stageNumber,
          endLap: lapTotal
        };
      });
    }
  }

  const liveStage = liveFeed?.stage || {};
  if (!stageEnds.length && liveStage.stage_num && liveStage.finish_at_lap) {
    const stageLength = numberOrZero(liveStage.laps_in_stage);
    const endLap = numberOrZero(liveStage.finish_at_lap);
    stageEnds = [{
      stageNumber: numberOrZero(liveStage.stage_num),
      endLap,
      startLap: stageLength ? endLap - stageLength + 1 : 1
    }];
  }

  const stages = stageEnds.map((stage, index) => {
    const previousEnd = stageEnds[index - 1]?.endLap || 0;
    const startLap = stage.startLap || previousEnd + 1;
    return {
      stageNumber: stage.stageNumber,
      startLap,
      endLap: stage.endLap,
      length: Math.max(0, stage.endLap - startLap + 1)
    };
  });

  if (!stages.length) {
    return {
      stages: [],
      currentStage: "",
      currentStageLap: "",
      currentStageLapsToGo: "",
      progressPercent: 0
    };
  }

  const liveStageNumber = numberOrZero(liveStage.stage_num);
  const lap = numberOrZero(currentLap);
  const lapStage = stages.find((stage) => lap <= stage.endLap)?.stageNumber || stages.at(-1).stageNumber;
  let currentStage = liveStageNumber || lapStage;

  if (liveStageNumber) {
    const liveStageWindow = stages.find((stage) => stage.stageNumber === liveStageNumber);
    if (!liveStageWindow || lap < liveStageWindow.startLap) {
      currentStage = lapStage;
    }
  }

  const activeStage = stages.find((stage) => stage.stageNumber === currentStage) || stages[0];
  const rawStageLap = lap ? lap - activeStage.startLap + 1 : 0;
  const currentStageLap = Math.min(Math.max(rawStageLap, 0), activeStage.length);
  const currentStageLapsToGo = lap ? Math.max(0, activeStage.endLap - lap) : activeStage.length;
  const progressPercent = activeStage.length
    ? Math.min(100, Math.max(0, currentStageLap / activeStage.length * 100))
    : 0;

  return {
    stages: stages.map((stage) => ({
      ...stage,
      rickyStartPosition: stage.stageNumber === 1
        ? numberOrZero(current.starting_position)
        : rickyStageResults[stage.stageNumber - 1] || "",
      rickyFinishPosition: rickyStageResults[stage.stageNumber] || "",
      status: lap >= stage.endLap
        ? "complete"
        : stage.stageNumber === currentStage
          ? "current"
          : "upcoming"
    })),
    currentStage,
    currentStageStartLap: activeStage.startLap,
    currentStageEndLap: activeStage.endLap,
    currentStageLength: activeStage.length,
    currentStageLap,
    currentStageLapsToGo,
    progressPercent
  };
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
  const raceComplete = isCompleteRaceFeed(weekendRace, liveFeed);
  const status = raceComplete ? "complete" : liveFeed ? "live" : "pre-race";
  const qualifyingComplete = raceComplete || hasStartingLineup(weekendRace);
  const scheduledLaps = normalizedRaceLapsValue(weekendRace, liveFeed) || "";
  const currentLap = liveFeed?.lap_number || (status === "complete" ? weekendRace.actual_laps || scheduledLaps : 0);
  const rawLapsToGo = liveFeed?.laps_to_go;
  const parsedLapsToGo = Number(rawLapsToGo);
  const numericScheduledLaps = Number(scheduledLaps);
  const numericCurrentLap = Number(currentLap || 0);
  const lapsToGo = status === "complete"
    ? 0
    : Number.isFinite(parsedLapsToGo)
      ? Number.isFinite(numericScheduledLaps) && numericScheduledLaps > 0 && parsedLapsToGo > numericScheduledLaps
        ? Math.max(0, numericScheduledLaps - numericCurrentLap)
        : parsedLapsToGo
      : rawLapsToGo || "";
  const stagePlan = buildStagePlan(weekendRace, liveFeed, currentLap, current);

  const lastPit = Array.isArray(current.pit_stops)
    ? current.pit_stops.filter((stop) => Number(stop.pit_in_lap_count) > 0).slice(-1)[0]
    : null;

  return {
    status,
    qualifyingComplete,
    sourceMode: liveFeed ? "NASCAR live feed" : "NASCAR weekend feed",
    raceId: weekendRace.race_id || race?.race_id || "",
    raceName: weekendRace.race_name || race?.race_name || "",
    trackName: weekendRace.track_name || race?.track_name || "",
    scheduled: raceTime(weekendRace) || raceTime(race),
    scheduledLaps,
    currentLap,
    lapsToGo,
    stage: liveFeed?.stage || "",
    stagePlan,
    flagState: status === "complete" ? 4 : liveFeed?.flag_state ?? 9,
    flagLabel: status === "complete" ? "Checkered" : liveFeed ? flagLabel(liveFeed.flag_state) : "Not live",
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

export async function buildDashboard() {
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
    sources: dashboardSources(currentRace),
    warnings,
    ...driverData,
    currentRace
  };
}
