const $ = (selector) => document.querySelector(selector);

const fields = {
  status: $("#wreckhouseStatus"),
  seasonIncidentCount: $("#seasonIncidentCount"),
  lastUpdated: $("#wreckLastUpdated"),
  seasonWrecks: $("#seasonWrecks"),
  notableWrecks: $("#notableWrecks"),
  sources: $("#wreckSources")
};

function value(input, fallback = "--") {
  if (input === 0) return "0";
  return input || fallback;
}

function setStatus(kind, text) {
  fields.status.className = `signal signal--${kind}`;
  fields.status.textContent = text;
  requestPillFit();
}

const PILL_SELECTOR = [
  ".signal",
  ".sync-cadence",
  ".nav-pill",
  ".source-chip",
  ".race-pill",
  ".hero__meta span"
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

function formatDate(input) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return value(input, "");
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function timeStamp(input) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "Updated just now";
  return `Updated ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" })}`;
}

function mediaMarkup(item) {
  const media = item.media || {};
  const url = media.url || item.sourceUrl;
  const thumbnail = item.thumbnail || media.thumbnail;
  const secondary = media.secondaryUrl ? `<a href="${media.secondaryUrl}" target="_blank" rel="noreferrer">In-car angle</a>` : "";
  const style = thumbnail ? ` style="--wreck-thumb: url('${thumbnail}');"` : "";
  const mediaClass = thumbnail ? "wreck-media wreck-media--link wreck-media--photo" : "wreck-media wreck-media--link";

  return `
    <a class="${mediaClass}" href="${url}" target="_blank" rel="noreferrer"${style}>
      <span class="play-mark">PLAY</span>
      <strong>${value(media.type, "Watch")}</strong>
      <small>${value(media.title, item.sourceLabel || "Open media")}</small>
    </a>
    ${secondary ? `<div class="wreck-card__links">${secondary}</div>` : ""}
  `;
}

function wreckCard(item) {
  const laps = item.lapsCompleted || item.scheduledLaps
    ? `<span>${value(item.lapsCompleted, "0")}/${value(item.scheduledLaps)} laps</span>`
    : "";
  return `
    <article class="wreck-card">
      ${mediaMarkup(item)}
      <div class="wreck-card__body">
        <div class="wreck-card__meta">
          <span>${value(item.scope)}</span>
          <time>${formatDate(item.date)}</time>
        </div>
        <h3>${value(item.title)}</h3>
        <p>${value(item.summary, "")}</p>
        <div class="wreck-facts">
          <span>${value(item.trackName)}</span>
          <span>${value(item.status)}</span>
          ${laps}
          ${item.finish ? `<span>Finish ${item.finish}</span>` : ""}
        </div>
        <a class="text-link" href="${item.sourceUrl}" target="_blank" rel="noreferrer">${value(item.sourceLabel, "Source")}</a>
      </div>
    </article>
  `;
}

function render(data) {
  fields.seasonIncidentCount.textContent = `${data.seasonIncidents.length} official 2026 incident`;
  if (data.seasonIncidents.length !== 1) {
    fields.seasonIncidentCount.textContent += "s";
  }
  fields.lastUpdated.textContent = timeStamp(data.generatedAt);

  fields.seasonWrecks.innerHTML = data.seasonIncidents.length
    ? data.seasonIncidents.map((item) => wreckCard({
        ...item,
        sourceLabel: "NASCAR race result",
        sourceUrl: item.sourceUrl
      })).join("")
    : `<div class="empty-state">No 2026 Cup race result currently marks Stenhouse with an accident or DNF status.</div>`;

  fields.notableWrecks.innerHTML = data.notableWrecks.map(wreckCard).join("");

  fields.sources.innerHTML = data.sources.map((source) => `
    <a href="${source.url}" target="_blank" rel="noreferrer">${source.label}</a>
  `).join("");

  requestPillFit();
}

async function loadWreckhouse() {
  setStatus("loading", "Loading");
  try {
    const response = await fetch("/api/wreckhouse", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    render(data);
    setStatus("ok", "Loaded");
  } catch (error) {
    console.error(error);
    setStatus("error", "Offline");
  }
}

loadWreckhouse();
window.addEventListener("resize", requestPillFit);
