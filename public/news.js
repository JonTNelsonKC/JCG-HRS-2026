const $ = (selector) => document.querySelector(selector);

const fields = {
  status: $("#newsStatus"),
  grid: $("#newsGrid"),
  sources: $("#newsSources")
};

const PILL_SELECTOR = [
  ".signal",
  ".nav-pill",
  ".source-chip",
  ".race-pill",
  ".hero__meta span",
  ".news-card__meta span",
  ".news-card__meta time"
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
  if (!input) return "News hub";
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(String(input)) ? `${input}T12:00:00` : input;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value(input, "News hub");
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function newsCard(item) {
  const rickyClass = /Ricky/i.test(item.category) ? " news-card--ricky" : "";
  return `
    <a class="news-card${rickyClass}" href="${item.url}" target="_blank" rel="noreferrer">
      <div class="news-card__meta">
        <span>${value(item.emphasis, "Public link")}</span>
        <time>${formatDate(item.date)}</time>
      </div>
      <div>
        <strong>${value(item.title)}</strong>
        <p>${value(item.summary, "")}</p>
      </div>
      <div class="news-card__footer">
        <span>${value(item.source, "Source")}</span>
        <span class="text-link">Open story</span>
      </div>
    </a>
  `;
}

function render(data) {
  fields.grid.innerHTML = data.links.length
    ? data.links.map(newsCard).join("")
    : `<div class="empty-state">No public news links are loaded yet.</div>`;

  fields.sources.innerHTML = data.sources.map((source) => `
    <a href="${source.url}" target="_blank" rel="noreferrer">${source.label}</a>
  `).join("");

  requestPillFit();
}

async function loadNews() {
  setStatus("loading", "Loading");
  try {
    const response = await fetch("/api/news", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    render(data);
    setStatus("ok", "Loaded");
  } catch (error) {
    console.error(error);
    setStatus("error", "Offline");
  }
}

loadNews();
window.addEventListener("resize", requestPillFit);
