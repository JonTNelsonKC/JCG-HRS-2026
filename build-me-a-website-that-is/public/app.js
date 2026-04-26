const state = {
  dashboard: null,
  timer: null,
  inFlight: false
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
  hyakLogo: $("#hyakLogo"),
  raceStatus: $("#raceStatus"),
  heroSponsor: $("#heroSponsor"),
  lastUpdated: $("#lastUpdated"),
  raceName: $("#raceName"),
  trackName: $("#trackName"),
  flagLight: $("#flagLight"),
  flagLabel: $("#flagLabel"),
  broadcastInfo: $("#broadcastInfo"),
  livePosition: $("#livePosition"),
  positionDelta: $("#positionDelta"),
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
  seasonMiniGrid: $("#seasonMiniGrid"),
  highlightsGrid: $("#highlightsGrid"),
  raceLogBody: $("#raceLogBody"),
  careerBody: $("#careerBody"),
  sourcesList: $("#sourcesList")
};

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

function timeAgo(input) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "Updated just now";
  return `Updated ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" })}`;
}

function flagKind(label) {
  const normalized = String(label || "").toLowerCase();
  if (normalized.includes("green")) return "green";
  if (normalized.includes("yellow")) return "yellow";
  if (normalized.includes("red")) return "red";
  if (normalized.includes("checkered")) return "checkered";
  return "non-live";
}

function setConnection(status, text) {
  fields.connectionStatus.className = `signal signal--${status}`;
  fields.connectionStatus.textContent = text;
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
  state.timer = window.setTimeout(loadDashboard, delayMs);
}

async function loadDashboard() {
  if (state.inFlight) return;
  state.inFlight = true;
  window.clearTimeout(state.timer);
  setConnection("loading", "Syncing");
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
    scheduleNextPoll(nextDelay);
  }
}

function render(data) {
  const { assets, driver, season, currentRace } = data;
  const stenhouse = currentRace.stenhouse || {};

  document.documentElement.style.setProperty("--hero-image", `url("${assets.hero}")`);
  fields.hyakLogo.src = assets.hyakLogo;

  fields.raceStatus.textContent = currentRace.status === "live" ? "Live now" : currentRace.status;
  fields.heroSponsor.textContent = `${value(stenhouse.sponsor, driver.sponsor)} Chevrolet`;
  fields.lastUpdated.textContent = timeAgo(data.generatedAt);
  fields.raceName.textContent = value(currentRace.raceName, "Race pending");
  fields.trackName.textContent = `${value(currentRace.trackName, "Track pending")} / ${dateTime(currentRace.scheduled)}`;
  fields.flagLabel.textContent = currentRace.flagLabel;
  fields.flagLight.dataset.flag = flagKind(currentRace.flagLabel);
  fields.broadcastInfo.textContent = [currentRace.tv, currentRace.radio, currentRace.satelliteRadio].filter(Boolean).join(" / ") || "Broadcast pending";

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

  renderLeaderboard(currentRace);
  renderSeason(season);
  renderHighlights(data.careerHighlights || []);
  renderRaceLog(data.raceLog || []);
  renderCareer(data.annualHistory || []);
  renderSources(data.sources || []);
}

function deltaLabel(delta) {
  if (delta === "" || delta === null || delta === undefined || Number.isNaN(Number(delta))) return "+/- --";
  const numeric = Number(delta);
  return numeric >= 0 ? `+${numeric}` : `${numeric}`;
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

fields.refreshButton.addEventListener("click", loadDashboard);
setupTabs();
loadDashboard();
