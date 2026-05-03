const $ = (selector) => document.querySelector(selector);

const fields = {
  status: $("#scheduleStatus"),
  count: $("#scheduleCount"),
  season: $("#scheduleSeason"),
  grid: $("#scheduleGrid"),
  sources: $("#scheduleSources")
};

const PILL_SELECTOR = [
  ".signal",
  ".nav-pill",
  ".source-chip",
  ".race-pill",
  ".hero__meta span",
  ".schedule-card__facts span"
].join(",");

function value(input, fallback = "--") {
  if (input === 0) return "0";
  return input || fallback;
}

function setStatus(kind, text) {
  if (!fields.status) return;
  fields.status.className = `signal signal--${kind}`;
  fields.status.textContent = text;
  requestPillFit();
}

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

function formatDate(input) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return value(input, "");
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(date);
}

function formatTime(input) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "Time pending";
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function stageText(stages) {
  return stages?.length ? `Stages ${stages.join("/")}` : "Stages pending";
}

function previousDelta(result) {
  const start = Number(result.start);
  const finish = Number(result.finish);
  if (!Number.isFinite(start) || !Number.isFinite(finish) || !start || !finish) return "";
  const delta = start - finish;
  if (delta > 0) return `+${delta}`;
  if (delta < 0) return `${delta}`;
  return "Even";
}

function previousResultMarkup(results, previousSeason) {
  if (!results?.length) {
    return `<div class="schedule-card__previous schedule-card__previous--empty">
      <span>${previousSeason} track record</span>
      <strong>No Ricky Cup result found</strong>
      <small>Checking NASCAR prior-season feeds</small>
    </div>`;
  }

  return results.map((result) => `
    <a class="schedule-card__previous" href="${result.sourceUrl}" target="_blank" rel="noreferrer">
      <span>${result.season} / ${formatDate(result.date)}</span>
      <strong>${value(result.raceName)}</strong>
      <small>Start P${value(result.start)} / Finish P${value(result.finish)}${previousDelta(result) ? ` / ${previousDelta(result)}` : ""}</small>
      <small>${value(result.status, "Result")} / ${value(result.points, "0")} pts</small>
    </a>
  `).join("");
}

function raceCard(race) {
  const broadcast = [race.tv, race.radio, race.satelliteRadio].filter(Boolean).join(" / ") || "Broadcast pending";
  return `
    <article class="schedule-card">
      <div class="schedule-card__top">
        <span>${formatDate(race.raceTime || race.date)}</span>
        <time>${formatTime(race.raceTime || race.date)}</time>
      </div>
      <div>
        <h3>${value(race.raceName)}</h3>
        <p>${value(race.trackName)}</p>
      </div>
      <div class="schedule-card__facts">
        <span>${value(race.laps)} laps</span>
        <span>${value(race.distance)} miles</span>
        <span>${stageText(race.stages)}</span>
      </div>
      <div class="schedule-card__broadcast">${broadcast}</div>
      <div class="schedule-card__history">
        <p class="section-kicker">${race.previousSeason} At This Track</p>
        ${previousResultMarkup(race.previousResults, race.previousSeason)}
      </div>
      <a class="text-link" href="${race.sourceUrl}" target="_blank" rel="noreferrer">Open NASCAR race page</a>
    </article>
  `;
}

function render(data) {
  fields.count.textContent = `${data.races.length} future races`;
  fields.season.textContent = `${data.season} Cup season`;
  fields.grid.innerHTML = data.races.length
    ? data.races.map(raceCard).join("")
    : `<div class="empty-state">No future Cup races found in the current NASCAR schedule feed.</div>`;

  fields.sources.innerHTML = data.sources.map((source) => `
    <a href="${source.url}" target="_blank" rel="noreferrer">${source.label}</a>
  `).join("");

  requestPillFit();
}

async function loadSchedule() {
  setStatus("loading", "Loading");
  try {
    const response = await fetch("/api/schedule", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    render(data);
    setStatus(data.warnings?.length ? "loading" : "ok", data.warnings?.length ? "Partial" : "Loaded");
  } catch (error) {
    console.error(error);
    setStatus("error", "Offline");
  }
}

loadSchedule();
window.addEventListener("resize", requestPillFit);
