const state = {
  dashboard: null,
  timer: null,
  inFlight: false,
  manualRefresh: false,
  countdownTimer: null,
  stageMemory: {
    raceId: null,
    starts: {},
    finishes: {}
  },
  stageProgressFrame: null,
  stageProgressStage: null,
  bingo: {
    raceKey: null,
    board: [],
    checked: []
  }
};

const $ = (selector) => document.querySelector(selector);
const POLL_INTERVALS = {
  live: 3000,
  preRace: 5000,
  fallback: 5000,
  complete: 30000,
  default: 8000
};

const fields = {
  connectionStatus: $("#connectionStatus"),
  syncCadence: $("#syncCadence"),
  refreshButton: $("#refreshButton"),
  raceControlMenu: $("#raceControlMenu"),
  hyakLogo: $("#hyakLogo"),
  raceStatus: $("#raceStatus"),
  heroSponsor: $("#heroSponsor"),
  raceName: $("#raceName"),
  trackName: $("#trackName"),
  raceCountdown: $("#raceCountdown"),
  flagLight: $("#flagLight"),
  flagLabel: $("#flagLabel"),
  broadcastInfo: $("#broadcastInfo"),
  stageTrackerSection: $("#stageTrackerSection"),
  stageSlotKicker: $("#stageSlotKicker"),
  stageTrackerTitle: $("#stageTrackerTitle"),
  stageRange: $("#stageRange"),
  stageRemaining: $("#stageRemaining"),
  stageProgress: $("#stageProgress"),
  stageProgressBar: $("#stageProgressBar"),
  stageSegments: $("#stageSegments"),
  raceHighlightStats: $("#raceHighlightStats"),
  positionLabel: $("#positionLabel"),
  livePosition: $("#livePosition"),
  positionDelta: $("#positionDelta"),
  wreckhouseMeter: $("#wreckhouseMeter"),
  wreckhouseLevelBadge: $("#wreckhouseLevelBadge"),
  wreckhousePercent: $("#wreckhousePercent"),
  wreckhouseLabel: $("#wreckhouseLabel"),
  wreckhouseLevel: $("#wreckhouseLevel"),
  wreckhouseBar: $("#wreckhouseBar"),
  wreckhouseMeta: $("#wreckhouseMeta"),
  raceLap: $("#raceLap"),
  lapsToGo: $("#lapsToGo"),
  lastLap: $("#lastLap"),
  lastLapSpeed: $("#lastLapSpeed"),
  bestLap: $("#bestLap"),
  bestLapSpeed: $("#bestLapSpeed"),
  lapsLed: $("#lapsLed"),
  avgRunningPosition: $("#avgRunningPosition"),
  seasonPoints: $("#seasonPoints"),
  seasonRank: $("#seasonRank"),
  sourceMode: $("#sourceMode"),
  driverName: $("#driverName"),
  driverDetails: $("#driverDetails"),
  detailSponsor: $("#detailSponsor"),
  detailCrewChief: $("#detailCrewChief"),
  detailStatus: $("#detailStatus"),
  detailLastPit: $("#detailLastPit"),
  detailPasses: $("#detailPasses"),
  detailFastest: $("#detailFastest"),
  leaderboardCount: $("#leaderboardCount"),
  leaderboardBody: $("#leaderboardBody"),
  bingoRaceTag: $("#bingoRaceTag"),
  bingoRaceNote: $("#bingoRaceNote"),
  bingoBoard: $("#bingoBoard"),
  seasonMiniGrid: $("#seasonMiniGrid"),
  highlightsGrid: $("#highlightsGrid"),
  raceLogBody: $("#raceLogBody"),
  careerBody: $("#careerBody"),
  sourcesList: $("#sourcesList")
};

const WRECKHOUSE_LEVEL_LABELS = {
  1: "Parked in the Shadow Realm",
  2: "Garage Radio Static",
  3: "Mid-Pack Mayhem",
  4: "Restart Spicy",
  5: "Full Wreckhouse"
};

const BINGO_FREE_INDEX = 12;
const BINGO_PHRASES = [
  "Broadcast forgets Ricky exists",
  "Randomly appears in the top 10",
  "Gets caught in someone else's mess",
  "Gains 5 spots and nobody mentions it",
  "Spotter earns overtime",
  "Restart gets suspiciously spicy",
  "Ricky chooses chaos",
  "Car is somehow tight and loose",
  "Fox camera cuts away right before something happens",
  "Pit stop makes everyone nervous",
  "Runs better after the booth stops talking",
  "Sneaks into the lucky dog conversation",
  "Avoids a wreck by the width of a hot dog",
  "Loses spots for mysterious reasons",
  "Gains spots for mysterious reasons",
  "Gets described as aggressive",
  "Radio sounds calm while the race is not calm",
  "Finds speed out of nowhere",
  "Ends up near a teammate somehow",
  "Stage points become mathematically possible",
  "The 47 enters goblin mode",
  "Someone else causes the problem",
  "Ricky survives the restart circus",
  "Caution saves the strategy",
  "Caution ruins the strategy",
  "Pit cycle turns into calculus",
  "Top 15 starts looking real",
  "Announcers say 'Stenhouse' with concern",
  "The car wakes up after halfway",
  "Superspeedway instincts activate",
  "Ricky is just minding his business",
  "The leaderboard teleports him",
  "Crew chief says something extremely crew chief",
  "A clean lap feels suspicious",
  "He becomes impossible to find on camera",
  "He shows up in the ticker like a ghost",
  "Pace car gets more screen time than Ricky",
  "Someone says 'track position' ominously",
  "Strategy wagon loses a wheel",
  "The 47 has entered the chat"
];

function value(input, fallback = "--") {
  if (input === 0) return "0";
  return input || fallback;
}

function numberValue(input, decimals = 2) {
  const numeric = Number(input);
  if (!Number.isFinite(numeric) || numeric === 0) return input === 0 ? "0" : "--";
  return numeric.toFixed(decimals).replace(/\.?0+$/, "");
}

function mph(input) {
  return input ? `${numberValue(input, 2)} mph` : "-- mph";
}

function lapTime(input) {
  return input ? `${numberValue(input, 3)}s` : "--";
}

function dateTime(input) {
  if (!input) return "";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function countdownParts(diffMs) {
  const totalSeconds = Math.max(0, Math.ceil(diffMs / 1000));
  const day = 24 * 60 * 60;
  const hour = 60 * 60;

  if (totalSeconds > day) {
    const days = Math.floor(totalSeconds / day);
    const hours = Math.floor((totalSeconds % day) / hour);
    return `${days}d ${hours}h`;
  }

  if (totalSeconds > hour) {
    const hours = Math.floor(totalSeconds / hour);
    const minutes = Math.floor((totalSeconds % hour) / 60);
    return `${hours}h ${minutes}m`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

function showCountdownSlot() {
  fields.raceCountdown.hidden = false;
  fields.flagLabel.classList.add("visually-hidden");
}

function showFlagSlot() {
  fields.raceCountdown.hidden = true;
  fields.flagLabel.classList.remove("visually-hidden");
}

function updateRaceCountdown() {
  const currentRace = state.dashboard?.currentRace;
  if (!fields.raceCountdown || !fields.flagLabel) return;

  const nextRace = currentRace?.nextRace;
  const now = Date.now();
  const flagText = String(currentRace?.flagLabel || "").toLowerCase();
  const isNonLiveFlag = flagText.includes("non-live") || flagText.includes("not live");
  const liveButPreStart = currentRace?.status === "live" && isNonLiveFlag;
  const nextRaceStart = nextRace?.scheduled ? new Date(nextRace.scheduled).getTime() : Number.NaN;
  const hasUpcomingRace = Number.isFinite(nextRaceStart) && nextRaceStart > now;

  if (currentRace?.status === "live" && !liveButPreStart) {
    fields.raceCountdown.textContent = "";
    fields.raceCountdown.dataset.state = "live";
    showFlagSlot();
    return;
  }

  showCountdownSlot();

  const countdownTarget = currentRace?.status === "pre-race" || liveButPreStart
    ? currentRace?.scheduled
    : hasUpcomingRace
      ? nextRace?.scheduled
      : null;

  if (!countdownTarget) {
    fields.raceCountdown.textContent = "--";
    fields.raceCountdown.dataset.state = "pending";
    return;
  }

  const start = new Date(countdownTarget).getTime();
  if (!Number.isFinite(start)) {
    fields.raceCountdown.textContent = "--";
    fields.raceCountdown.dataset.state = "pending";
    return;
  }

  const diffMs = start - now;
  fields.raceCountdown.textContent = diffMs <= 0 ? "Starting now" : countdownParts(diffMs);
  fields.raceCountdown.dataset.state = diffMs <= 0 ? "live" : currentRace?.status === "complete" ? "next-race" : "pending";
}

function startRaceCountdown() {
  updateRaceCountdown();
  window.clearInterval(state.countdownTimer);
  state.countdownTimer = window.setInterval(updateRaceCountdown, 1000);
}

function flagKind(label) {
  const normalized = String(label || "").toLowerCase();
  if (normalized.includes("checkered")) return "checkered";
  if (normalized.includes("green")) return "green";
  if (normalized.includes("yellow")) return "yellow";
  if (normalized.includes("red")) return "red";
  return "non-live";
}

function setConnection(status, text) {
  fields.connectionStatus.className = `signal signal--${status}`;
  fields.connectionStatus.textContent = text;
  requestPillFit();
}

function pollDelayFor(dashboard) {
  const status = dashboard?.currentRace?.status;
  if (status === "live") return POLL_INTERVALS.live;
  if (status === "pre-race") return POLL_INTERVALS.preRace;
  if (status === "complete") return POLL_INTERVALS.complete;
  if (dashboard?.warnings?.length) return POLL_INTERVALS.fallback;
  return POLL_INTERVALS.default;
}

function scheduleNextPoll(delayMs) {
  window.clearTimeout(state.timer);
  fields.syncCadence.textContent = `${Math.round(delayMs / 1000)}s sync`;
  requestPillFit();
  state.timer = window.setTimeout(loadDashboard, delayMs);
}

async function loadDashboard() {
  if (state.inFlight) return;
  state.inFlight = true;
  window.clearTimeout(state.timer);
  if (!state.dashboard || state.manualRefresh) {
    setConnection("loading", "Syncing");
  }
  let nextDelay = POLL_INTERVALS.fallback;

  try {
    const response = await fetch("/api/dashboard", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    state.dashboard = await response.json();
    render(state.dashboard);
    setConnection(state.dashboard.warnings?.length ? "loading" : "ok", state.dashboard.warnings?.length ? "Fallback" : "Live sync");
    nextDelay = pollDelayFor(state.dashboard);
  } catch (error) {
    setConnection("error", "Offline");
    console.error(error);
  } finally {
    state.inFlight = false;
    state.manualRefresh = false;
    scheduleNextPoll(nextDelay);
  }
}

const PILL_SELECTOR = [
  ".signal",
  ".sync-cadence",
  ".nav-pill",
  ".source-chip",
  ".race-pill",
  ".hero__meta span",
  ".stage-tracker__meta span",
  ".race-highlight-stat strong",
  ".stat-card strong",
  ".stat-card span:last-child"
].join(",");

function fitTextPill(element) {
  element.style.removeProperty("--pill-font-size");
  const available = element.clientWidth;
  const needed = element.scrollWidth;
  if (!available || needed <= available) return;

  const baseSize = Number.parseFloat(getComputedStyle(element).fontSize) || 12;
  const nextSize = Math.max(9, Math.floor(baseSize * available / needed));
  element.style.setProperty("--pill-font-size", `${nextSize}px`);
}

function fitTextPills() {
  document.querySelectorAll(PILL_SELECTOR).forEach(fitTextPill);
}

function requestPillFit() {
  window.requestAnimationFrame(fitTextPills);
}

function render(data) {
  const { assets, driver, season, currentRace } = data;
  const stenhouse = currentRace.stenhouse || {};

  document.documentElement.style.setProperty("--hero-image", `url("${assets.hero}")`);
  fields.hyakLogo.src = assets.hyakLogo;

  fields.raceStatus.textContent = currentRace.status === "live" ? "Live now" : currentRace.status;
  fields.heroSponsor.textContent = `${value(stenhouse.sponsor, driver.sponsor)} Chevrolet`;
  fields.raceName.textContent = value(currentRace.raceName, "Race pending");
  fields.trackName.textContent = `${value(currentRace.trackName, "Track pending")} / ${dateTime(currentRace.scheduled)}`;
  fields.flagLabel.textContent = currentRace.flagLabel;
  fields.flagLight.dataset.flag = flagKind(currentRace.flagLabel);
  updateRaceCountdown();
  fields.broadcastInfo.textContent = [currentRace.tv, currentRace.radio, currentRace.satelliteRadio].filter(Boolean).join(" / ") || "Broadcast pending";

  fields.positionLabel.textContent = currentRace.status === "complete" ? "Final Position" : "Running Position";
  fields.livePosition.textContent = currentRace.status === "pre-race" ? `P${value(stenhouse.start)}` : `P${value(stenhouse.position)}`;
  fields.positionDelta.textContent = currentRace.status === "pre-race"
    ? `Starting ${value(stenhouse.start)}`
    : `Start ${value(stenhouse.start)} / ${deltaLabel(stenhouse.positionDelta)}`;
  fields.raceLap.textContent = currentRace.currentLap ? `${currentRace.currentLap}/${value(currentRace.scheduledLaps)}` : `0/${value(currentRace.scheduledLaps)}`;
  fields.lapsToGo.textContent = currentRace.lapsToGo ? `${currentRace.lapsToGo} to go` : value(currentRace.elapsed, "Waiting on green");
  fields.lastLap.textContent = lapTime(stenhouse.lastLapTime);
  fields.lastLapSpeed.textContent = mph(stenhouse.lastLapSpeed);
  fields.bestLap.textContent = lapTime(stenhouse.bestLapTime);
  fields.bestLapSpeed.textContent = mph(stenhouse.bestLapSpeed);
  fields.lapsLed.textContent = value(stenhouse.lapsLed, "0");
  fields.avgRunningPosition.textContent = stenhouse.avgRunningPosition ? `Avg run ${numberValue(stenhouse.avgRunningPosition, 1)}` : "Avg run --";
  fields.seasonPoints.textContent = value(season.points);
  fields.seasonRank.textContent = `Rank ${value(season.rank)} / ${value(season.pointsBehind)} behind`;

  fields.sourceMode.textContent = currentRace.sourceMode;
  fields.driverName.textContent = driver.name;
  fields.driverDetails.textContent = `${driver.team} / No. ${driver.number} / ${driver.manufacturer}`;
  fields.detailSponsor.textContent = value(stenhouse.sponsor, driver.sponsor);
  fields.detailCrewChief.textContent = value(driver.crewChief);
  fields.detailStatus.textContent = value(stenhouse.status, currentRace.status);
  fields.detailLastPit.textContent = stenhouse.lastPit
    ? `Lap ${stenhouse.lastPit.lap} / ${numberValue(stenhouse.lastPit.duration, 2)}s`
    : "--";
  fields.detailPasses.textContent = stenhouse.passesMade
    ? `${stenhouse.passesMade} / diff ${value(stenhouse.passingDifferential, "0")}`
    : "--";
  fields.detailFastest.textContent = value(stenhouse.fastestLapsRun, "0");

  renderWreckhouseMeter(currentRace);
  renderLeaderboard(currentRace);
  renderStageTracker(currentRace);
  renderBingo(currentRace);
  renderSeason(season);
  renderHighlights(data.careerHighlights || []);
  renderRaceLog(data.raceLog || []);
  renderCareer(data.annualHistory || []);
  renderSources(data.sources || []);
  requestPillFit();
}

function deltaLabel(delta) {
  if (delta === "" || delta === null || delta === undefined || Number.isNaN(Number(delta))) return "+/- --";
  const numeric = Number(delta);
  return numeric >= 0 ? `+${numeric}` : `${numeric}`;
}

function numericPosition(input) {
  const numeric = Number(input);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : "";
}

function clamp(input, min, max) {
  return Math.min(max, Math.max(min, input));
}

function wreckhouseLevelFor(percent) {
  if (percent <= 20) return 1;
  if (percent <= 40) return 2;
  if (percent <= 60) return 3;
  if (percent <= 80) return 4;
  return 5;
}

function computeWreckhouseMeter(currentRace) {
  const position = numericPosition(currentRace?.stenhouse?.position);
  const fieldSize = Array.isArray(currentRace?.field) ? currentRace.field.length : 0;

  if (!position || fieldSize < 2) return null;

  const rawPercent = ((fieldSize - position) / (fieldSize - 1)) * 100;
  const percent = Math.round(clamp(rawPercent, 0, 100));
  const level = wreckhouseLevelFor(percent);

  return {
    position,
    fieldSize,
    percent,
    level,
    label: WRECKHOUSE_LEVEL_LABELS[level]
  };
}

function renderWreckhouseMeter(currentRace) {
  const meter = computeWreckhouseMeter(currentRace);

  if (!meter) {
    fields.wreckhouseMeter.dataset.level = "standby";
    fields.wreckhouseLevelBadge.textContent = "Standing by";
    fields.wreckhousePercent.textContent = "Stand by";
    fields.wreckhouseLabel.textContent = "Wreckhouse Meter standing by.";
    fields.wreckhouseLevel.textContent = "--";
    fields.wreckhouseBar.style.width = "0%";
    fields.wreckhouseMeta.textContent = "Need Ricky's running spot and the full field to light it up.";
    return;
  }

  fields.wreckhouseMeter.dataset.level = String(meter.level);
  fields.wreckhouseLevelBadge.textContent = `Level ${meter.level}`;
  fields.wreckhousePercent.textContent = `${meter.percent}%`;
  fields.wreckhouseLabel.textContent = `Level ${meter.level}: ${meter.label}`;
  fields.wreckhouseLevel.textContent = String(meter.level);
  fields.wreckhouseBar.style.width = `${meter.percent}%`;
  fields.wreckhouseMeta.textContent = currentRace.status === "complete"
    ? `Checkered at P${meter.position} out of ${meter.fieldSize}`
    : `Running P${meter.position} out of ${meter.fieldSize}`;
}

function bingoStorageKey(raceKey) {
  return `stenhouse-bingo:${raceKey}`;
}

function seedFromString(input) {
  let hash = 2166136261;
  const text = String(input || "stenhouse-bingo");

  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function mulberry32(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6D2B79F5;
    let mixed = value;
    mixed = Math.imul(mixed ^ mixed >>> 15, mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ mixed >>> 7, mixed | 61);
    return ((mixed ^ mixed >>> 14) >>> 0) / 4294967296;
  };
}

function seededShuffle(items, seedKey) {
  const shuffled = [...items];
  const random = mulberry32(seedFromString(seedKey));

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function currentRaceBingoKey(currentRace) {
  return String(
    currentRace?.raceId
    || [currentRace?.raceName, currentRace?.trackName, currentRace?.scheduled].filter(Boolean).join("|")
    || "pending-race"
  );
}

function buildBingoBoard(raceKey) {
  const pool = seededShuffle(BINGO_PHRASES, `${raceKey}:bingo`).slice(0, 24);
  const board = [];
  let phraseIndex = 0;

  for (let index = 0; index < 25; index += 1) {
    if (index === BINGO_FREE_INDEX) {
      board.push({
        label: "FREE SPACE",
        free: true
      });
      continue;
    }

    board.push({
      label: pool[phraseIndex],
      free: false
    });
    phraseIndex += 1;
  }

  return board;
}

function readBingoState(raceKey) {
  try {
    return JSON.parse(window.localStorage.getItem(bingoStorageKey(raceKey)) || "{}");
  } catch {
    return {};
  }
}

function writeBingoState(bingo) {
  if (!bingo?.raceKey) return;

  try {
    window.localStorage.setItem(bingoStorageKey(bingo.raceKey), JSON.stringify({
      board: bingo.board,
      checked: bingo.checked
    }));
  } catch {
    // Local storage can be unavailable in private or locked-down browser contexts.
  }
}

function ensureBingoState(currentRace) {
  const raceKey = currentRaceBingoKey(currentRace);

  if (state.bingo.raceKey !== raceKey) {
    const cached = readBingoState(raceKey);
    const board = Array.isArray(cached.board) && cached.board.length === 25
      ? cached.board
      : buildBingoBoard(raceKey);
    const checked = Array.isArray(cached.checked) && cached.checked.length === 25
      ? cached.checked.map(Boolean)
      : Array.from({ length: 25 }, (_, index) => index === BINGO_FREE_INDEX);

    checked[BINGO_FREE_INDEX] = true;

    state.bingo = {
      raceKey,
      board,
      checked
    };

    writeBingoState(state.bingo);
  }

  return state.bingo;
}

function renderBingoStandby() {
  fields.bingoRaceTag.textContent = "Race board";
  fields.bingoRaceNote.textContent = "Waiting for the next locked-in race card.";
  fields.bingoBoard.innerHTML = `
    <div class="empty-state bingo-empty-state">
      <strong>Ricky Bingo is standing by.</strong>
      <p>We will deal a fresh 5x5 card as soon as the current race is ready.</p>
    </div>
  `;
}

function renderBingo(currentRace) {
  if (!currentRace?.raceId && !currentRace?.raceName && !currentRace?.trackName && !currentRace?.scheduled) {
    renderBingoStandby();
    return;
  }

  const bingo = ensureBingoState(currentRace);
  const raceLabel = currentRace.raceName || currentRace.trackName || "this race";

  fields.bingoRaceTag.textContent = "5x5 race card";
  fields.bingoRaceNote.textContent = `Locked to ${raceLabel} and resets when the next race takes over.`;
  fields.bingoBoard.innerHTML = bingo.board.map((square, index) => {
    const checked = Boolean(bingo.checked[index]);
    const classes = [
      "bingo-cell",
      checked ? "is-checked" : "",
      square.free ? "is-free" : ""
    ].filter(Boolean).join(" ");

    return `
      <button
        class="${classes}"
        type="button"
        data-bingo-index="${index}"
        aria-pressed="${checked ? "true" : "false"}"
        ${square.free ? "disabled" : ""}
      >
        <span>${square.free ? "Free space" : `Square ${index + 1}`}</span>
        <strong>${square.label}</strong>
      </button>
    `;
  }).join("");
}

function toggleBingoSquare(index) {
  const bingo = state.bingo;
  if (!bingo.board.length || index === BINGO_FREE_INDEX || !bingo.board[index]) return;

  bingo.checked[index] = !bingo.checked[index];
  writeBingoState(bingo);
  renderBingo(state.dashboard?.currentRace || {});
}

function stageMemoryKey(raceId) {
  return `stenhouse-stage-memory:${raceId}`;
}

function readStageMemory(raceId) {
  try {
    return JSON.parse(window.localStorage.getItem(stageMemoryKey(raceId)) || "{}");
  } catch {
    return {};
  }
}

function writeStageMemory(memory) {
  if (!memory.raceId) return;
  try {
    window.localStorage.setItem(stageMemoryKey(memory.raceId), JSON.stringify({
      starts: memory.starts,
      finishes: memory.finishes
    }));
  } catch {
    // Local storage can be disabled; live in-memory tracking still works.
  }
}

function ensureStageMemory(currentRace) {
  const raceId = currentRace.raceId || "current-race";
  if (state.stageMemory.raceId !== raceId) {
    const cached = readStageMemory(raceId);
    state.stageMemory = {
      raceId,
      starts: cached.starts || {},
      finishes: cached.finishes || {}
    };
  }
  return state.stageMemory;
}

function updateStageMemory(currentRace, stages) {
  const memory = ensureStageMemory(currentRace);
  const stenhouse = currentRace.stenhouse || {};
  const position = numericPosition(stenhouse.position);
  const startPosition = numericPosition(stenhouse.start);
  const lap = Number(currentRace.currentLap || 0);
  const activeStageNumber = Number(currentRace.stagePlan?.currentStage || 0);
  let changed = false;

  stages.forEach((stage) => {
    const key = String(stage.stageNumber);
    const officialStart = numericPosition(stage.rickyStartPosition);
    const officialFinish = numericPosition(stage.rickyFinishPosition);

    if (!memory.starts[key] && (officialStart || stage.stageNumber === 1 && startPosition)) {
      memory.starts[key] = officialStart || startPosition;
      changed = true;
    }

    if (!memory.finishes[key] && officialFinish) {
      memory.finishes[key] = officialFinish;
      changed = true;
    }

    if (!position) return;

    const justStartedStage = activeStageNumber === stage.stageNumber
      && lap >= stage.startLap
      && lap <= stage.startLap + 2;
    if (!memory.starts[key] && justStartedStage) {
      memory.starts[key] = position;
      changed = true;
    }

    const justFinishedStage = lap >= stage.endLap && lap <= stage.endLap + 3;
    const finalStageComplete = currentRace.status === "complete"
      && stage.stageNumber === stages.at(-1)?.stageNumber;
    if (!memory.finishes[key] && (justFinishedStage || finalStageComplete)) {
      memory.finishes[key] = position;
      changed = true;
    }
  });

  if (changed) writeStageMemory(memory);
  return memory;
}

function stageOutcome(stage, memory) {
  const start = numericPosition(memory.starts[String(stage.stageNumber)] || stage.rickyStartPosition);
  const finish = numericPosition(memory.finishes[String(stage.stageNumber)] || stage.rickyFinishPosition);

  if (!start || !finish) {
    return {
      className: "pending",
      detail: stage.status === "current" ? "In progress" : `${stage.length} laps`
    };
  }

  if (finish < start) {
    return {
      className: "gain",
      detail: `P${start} to P${finish}`
    };
  }

  if (finish > start) {
    return {
      className: "loss",
      detail: `P${start} to P${finish}`
    };
  }

  return {
    className: "even",
    detail: `Held P${finish}`
  };
}

function hasQualifyingLineup(currentRace) {
  return currentRace.qualifyingComplete === true;
}

function setStageProgress(percent) {
  fields.stageProgressBar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
}

function estimatedLapMs(currentRace) {
  const candidates = [
    currentRace.stenhouse?.lastLapTime,
    currentRace.stenhouseRow?.lastLap,
    ...(currentRace.topTen || []).map((row) => row.lastLap)
  ];
  const lapSeconds = Number(candidates.find((candidate) => Number(candidate) > 0));
  if (!Number.isFinite(lapSeconds)) return 45_000;
  return Math.min(180_000, Math.max(15_000, lapSeconds * 1000));
}

function animateStageProgress(currentRace, plan, progress) {
  window.cancelAnimationFrame(state.stageProgressFrame);

  const stageLength = Number(plan.currentStageLength || 0);
  const activeStage = plan.currentStage || "stage-plan";
  if (currentRace.status !== "live" || !stageLength || progress >= 100) {
    state.stageProgressStage = activeStage;
    setStageProgress(progress);
    return;
  }

  const nextLapTarget = Math.min(100, progress + 100 / stageLength);
  const displayed = Number.parseFloat(fields.stageProgressBar.style.width);
  const sameStage = state.stageProgressStage === activeStage;
  const startPercent = sameStage && Number.isFinite(displayed) && displayed >= progress && displayed <= nextLapTarget
    ? displayed
    : progress;
  const startTime = performance.now();
  const duration = estimatedLapMs(currentRace);
  state.stageProgressStage = activeStage;

  const tick = (now) => {
    const amount = Math.min(1, (now - startTime) / duration);
    const eased = 1 - Math.pow(1 - amount, 2);
    const width = startPercent + (nextLapTarget - startPercent) * eased;
    setStageProgress(width);
    if (amount < 1) {
      state.stageProgressFrame = window.requestAnimationFrame(tick);
    }
  };

  state.stageProgressFrame = window.requestAnimationFrame(tick);
}

function racePositionTone(start, finish) {
  if (!start || !finish) return "neutral";
  if (finish < start) return "gain";
  if (finish > start) return "loss";
  return "neutral";
}

function raceDeltaText(start, finish) {
  if (!start || !finish) return "+/- --";
  const delta = start - finish;
  if (delta > 0) return `+${delta} spots`;
  if (delta < 0) return `${Math.abs(delta)} lost`;
  return "Held spot";
}

function renderRaceHighlights(currentRace, stages, memory) {
  window.cancelAnimationFrame(state.stageProgressFrame);
  state.stageProgressStage = null;

  const stenhouse = currentRace.stenhouse || {};
  const start = numericPosition(stenhouse.start);
  const finish = numericPosition(stenhouse.position);
  const lapsCompleted = stenhouse.lapsCompleted || currentRace.currentLap || "";
  const stageWins = stages.filter((stage) => stageOutcome(stage, memory).className === "gain").length;
  const stageLosses = stages.filter((stage) => stageOutcome(stage, memory).className === "loss").length;
  const stageSummary = stageWins || stageLosses
    ? `${stageWins} gain / ${stageLosses} loss`
    : "Pending official scoring";

  fields.stageSlotKicker.textContent = "Race Highlights";
  fields.stageTrackerTitle.textContent = "Checkered flag recap";
  fields.stageRemaining.textContent = "Race complete";
  fields.stageProgress.hidden = true;
  fields.stageSegments.hidden = true;
  fields.raceHighlightStats.hidden = false;

  const stats = [
    ["Finish", finish ? `P${finish}` : "--", "Race result"],
    ["Started", start ? `P${start}` : "--", raceDeltaText(start, finish), racePositionTone(start, finish)],
    ["Laps", lapsCompleted ? `${lapsCompleted}/${value(currentRace.scheduledLaps)}` : "--", "Completed"],
    ["Laps Led", value(stenhouse.lapsLed, "0"), "No. 47 out front"],
    ["Cautions", value(currentRace.cautions, "0"), `${value(currentRace.cautionLaps, "0")} caution laps`],
    ["Lead Changes", value(currentRace.leadChanges, "0"), `${value(currentRace.leaders, "0")} leaders`],
    ["Best Lap", lapTime(stenhouse.bestLapTime), mph(stenhouse.bestLapSpeed)],
    ["Stages", stageSummary, "Position swings"]
  ];

  fields.raceHighlightStats.innerHTML = stats.map(([label, stat, detail, tone = "neutral"]) => `
    <article class="race-highlight-stat race-highlight-stat--${tone}">
      <span>${label}</span>
      <strong>${stat}</strong>
      <small>${detail}</small>
    </article>
  `).join("");
}

function renderStageTracker(currentRace) {
  if (!hasQualifyingLineup(currentRace)) {
    window.cancelAnimationFrame(state.stageProgressFrame);
    state.stageProgressStage = null;
    fields.stageTrackerSection.hidden = true;
    return;
  }

  fields.stageTrackerSection.hidden = false;

  const plan = currentRace.stagePlan || {};
  const stages = plan.stages || [];
  const currentStage = plan.currentStage ? `Stage ${plan.currentStage}` : "Stage plan";
  const progress = Number(plan.progressPercent || 0);
  const memory = updateStageMemory(currentRace, stages);

  if (currentRace.status === "complete") {
    renderRaceHighlights(currentRace, stages, memory);
    return;
  }

  fields.stageSlotKicker.textContent = "Race Stage Tracker";
  fields.stageProgress.hidden = false;
  fields.stageSegments.hidden = false;
  fields.raceHighlightStats.hidden = true;
  fields.stageTrackerTitle.textContent = currentStage;
  fields.stageRemaining.textContent = plan.currentStageLapsToGo !== ""
    ? `${value(plan.currentStageLapsToGo, "0")} laps to stage end`
    : "Stage timing pending";
  animateStageProgress(currentRace, plan, progress);

  fields.stageSegments.innerHTML = stages.length
    ? stages.map((stage) => {
        const outcome = stageOutcome(stage, memory);
        return `
        <div class="stage-segment stage-segment--${outcome.className}">
          <span>Stage ${stage.stageNumber}</span>
          <strong>${stage.startLap}-${stage.endLap}</strong>
          <small>${outcome.detail}</small>
        </div>
      `;
      }).join("")
    : `<div class="stage-segment stage-segment--pending">
        <span>Stage data</span>
        <strong>Pending</strong>
        <small>Waiting on NASCAR feed</small>
      </div>`;
}

function renderLeaderboard(currentRace) {
  const rows = currentRace.topTen || [];
  const stenhouse = currentRace.stenhouseRow;
  const displayRows = stenhouse && !rows.some((row) => row.isStenhouse)
    ? [...rows, stenhouse]
    : rows;

  fields.leaderboardCount.textContent = stenhouse && !rows.some((row) => row.isStenhouse) ? "Top 10 + 47" : "Top 10";
  fields.leaderboardBody.innerHTML = displayRows.map((row) => `
    <tr class="${row.isStenhouse ? "is-stenhouse" : ""}">
      <td>${value(row.position)}</td>
      <td>${value(row.driver)}</td>
      <td>${value(row.carNumber)}</td>
      <td>${row.delta === "Leader" ? "Leader" : value(row.delta)}</td>
      <td>${value(row.laps, "0")}</td>
    </tr>
  `).join("");
}

function renderSeason(season) {
  const stats = [
    ["Rank", season.rank],
    ["Points", season.points],
    ["Races", season.races],
    ["Wins", season.wins],
    ["Top 5", season.top5],
    ["Top 10", season.top10],
    ["Poles", season.poles],
    ["DNF", season.dnf],
    ["Laps Led", season.lapsLed],
    ["Avg Start", season.avgStart],
    ["Avg Finish", season.avgFinish],
    ["Behind", season.pointsBehind]
  ];

  fields.seasonMiniGrid.innerHTML = stats.map(([label, stat]) => `
    <div class="mini-stat">
      <span>${label}</span>
      <strong>${value(stat)}</strong>
    </div>
  `).join("");
}

function renderHighlights(items) {
  fields.highlightsGrid.innerHTML = items.map((item) => `
    <article class="highlight-card">
      <div class="highlight-card__top">
        <span>${value(item.category, "Highlight")}</span>
        <time>${value(item.year)}</time>
      </div>
      <strong>${value(item.title)}</strong>
      <p>${value(item.detail, "")}</p>
    </article>
  `).join("");
}

function renderRaceLog(races) {
  fields.raceLogBody.innerHTML = races.map((race) => `
    <tr class="${/Talladega/i.test(race.track) ? "is-stenhouse" : ""}">
      <td>${value(race.track)}</td>
      <td>${value(race.start)}</td>
      <td>${race.finish === "0" ? "--" : value(race.finish)}</td>
      <td>${value(race.points, "0")}</td>
    </tr>
  `).join("");
}

function renderCareer(rows) {
  fields.careerBody.innerHTML = rows.map((row) => `
    <tr>
      <td>${value(row.year)}</td>
      <td>${value(row.rank)}</td>
      <td>${value(row.wins)}</td>
      <td>${value(row.top5)}</td>
      <td>${value(row.top10)}</td>
      <td>${value(row.poles)}</td>
      <td>${value(row.lapsLed)}</td>
      <td>${value(row.avgStart)}</td>
      <td>${value(row.avgFinish)}</td>
    </tr>
  `).join("");
}

function renderSources(sources) {
  fields.sourcesList.innerHTML = sources.map((source) => `
    <a href="${source.url}" target="_blank" rel="noreferrer">${source.label}</a>
  `).join("");
}

function setupTabs() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const selected = tab.dataset.tab;
      document.querySelectorAll(".tab").forEach((button) => {
        button.classList.toggle("is-active", button === tab);
        button.setAttribute("aria-selected", button === tab ? "true" : "false");
      });
      document.querySelectorAll(".tab-panel").forEach((panel) => {
        const active = panel.id === `tab-${selected}`;
        panel.classList.toggle("is-active", active);
        panel.hidden = !active;
      });
    });
  });
}

function closeRaceControlMenu() {
  if (fields.raceControlMenu) {
    fields.raceControlMenu.open = false;
  }
}

function setupRaceControlMenu() {
  fields.refreshButton.addEventListener("click", () => {
    closeRaceControlMenu();
    state.manualRefresh = true;
    loadDashboard();
  });

  document.addEventListener("click", (event) => {
    if (!fields.raceControlMenu?.open || fields.raceControlMenu.contains(event.target)) return;
    closeRaceControlMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeRaceControlMenu();
  });
}

function setupBingoBoard() {
  fields.bingoBoard.addEventListener("click", (event) => {
    const square = event.target.closest("[data-bingo-index]");
    if (!square) return;

    toggleBingoSquare(Number(square.dataset.bingoIndex));
  });
}

setupRaceControlMenu();
setupBingoBoard();
setupTabs();
window.addEventListener("resize", requestPillFit);
startRaceCountdown();
loadDashboard();
