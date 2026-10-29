const $ = (selector) => document.querySelector(selector);

const fields = {
  status: $("#wreckhouseStatus"),
  seasonIncidentCount: $("#seasonIncidentCount"),
  lastUpdated: $("#wreckLastUpdated"),
  season: $("#wreckSeason"),
  seasonWrecks: $("#seasonWrecks"),
  notableWrecks: $("#notableWrecks"),
  sources: $("#wreckSources"),
  videoDialog: $("#wreckVideoDialog"),
  videoFrame: $("#wreckVideoFrame"),
  videoTitle: $("#wreckVideoTitle"),
  videoClose: $("#wreckVideoClose")
};

const REFRESH_INTERVAL = 60_000;
let refreshTimer = null;
let requestInFlight = false;

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

function attributeValue(input) {
  return String(input || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function mediaMarkup(item) {
  const media = item.media || {};
  const thumbnail = item.thumbnail || media.thumbnail;
  const embedUrl = item.embedUrl || media.embedUrl || "";
  const style = thumbnail ? ` style="--wreck-thumb: url('${thumbnail}');"` : "";
  const mediaClass = thumbnail ? "wreck-media wreck-media--link wreck-media--photo" : "wreck-media wreck-media--link";

  if (!embedUrl) {
    return `
      <div class="${mediaClass} wreck-media--pending"${style}>
        <span class="play-mark">CLIP</span>
        <strong>Inline video pending</strong>
        <small>Use the verified source below for this item.</small>
      </div>
    `;
  }

  return `
    <button
      class="${mediaClass}"
      type="button"
      data-wreck-video="${attributeValue(embedUrl)}"
      data-wreck-title="${attributeValue(media.title || item.title || "Wreckhouse Video")}"
      aria-label="Play ${attributeValue(media.title || item.title || "Wreckhouse video")}"${style}
    >
      <span class="play-mark">PLAY</span>
      <strong>${value(media.type, "Watch")}</strong>
      <small>${value(media.title, item.sourceLabel || "Open media")}</small>
    </button>
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
  fields.season.textContent = value(data.season, "Current Season");
  fields.seasonIncidentCount.textContent = `${data.seasonIncidents.length} official ${value(data.season, "season")} incident`;
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
    : `<div class="empty-state">No ${value(data.season, "current-season")} Cup race result currently marks Stenhouse with an accident or DNF status.</div>`;

  fields.notableWrecks.innerHTML = data.notableWrecks.map(wreckCard).join("");

  fields.sources.innerHTML = data.sources.map((source) => `
    <a href="${source.url}" target="_blank" rel="noreferrer">${source.label}</a>
  `).join("");

  requestPillFit();
}

function stopVideo() {
  fields.videoFrame.src = "about:blank";
}

function openVideo(url, title) {
  if (!url || !fields.videoDialog) return;
  fields.videoTitle.textContent = title || "Wreckhouse Video";
  fields.videoFrame.src = url;
  fields.videoDialog.showModal();
}

function closeVideo() {
  if (fields.videoDialog?.open) fields.videoDialog.close();
  stopVideo();
}

function scheduleRefresh() {
  window.clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(() => loadWreckhouse(true), REFRESH_INTERVAL);
}

async function loadWreckhouse(silent = false) {
  if (requestInFlight) return;
  requestInFlight = true;
  if (!silent) setStatus("loading", "Loading");
  try {
    const response = await fetch("/api/wreckhouse", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    render(data);
    setStatus("ok", "Loaded");
  } catch (error) {
    console.error(error);
    setStatus("error", "Offline");
  } finally {
    requestInFlight = false;
    scheduleRefresh();
  }
}

loadWreckhouse();
document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-wreck-video]");
  if (!trigger) return;
  openVideo(trigger.dataset.wreckVideo, trigger.dataset.wreckTitle);
});
fields.videoClose?.addEventListener("click", closeVideo);
fields.videoDialog?.addEventListener("close", stopVideo);
fields.videoDialog?.addEventListener("click", (event) => {
  if (event.target === fields.videoDialog) closeVideo();
});
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) loadWreckhouse(true);
});
window.addEventListener("resize", requestPillFit);
