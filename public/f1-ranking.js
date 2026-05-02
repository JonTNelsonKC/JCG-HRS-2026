const $ = (selector) => document.querySelector(selector);

const drivers = [
  {
    rank: 1,
    name: "Charles Leclerc",
    team: "Ferrari",
    number: "16",
    country: "Monaco",
    imageTeam: "ferrari",
    imageCode: "chalec01",
    tone: "The internet's default pole sitter for this exact category.",
    source: "Ranker fan poll #1",
    profile: "https://www.formula1.com/en/drivers/charles-leclerc"
  },
  {
    rank: 2,
    name: "Carlos Sainz",
    team: "Williams",
    number: "55",
    country: "Spain",
    imageTeam: "williams",
    imageCode: "carsai01",
    tone: "Smooth operator, strong jawline, frighteningly consistent hair.",
    source: "Ranker fan poll #2",
    profile: "https://www.formula1.com/en/drivers/carlos-sainz"
  },
  {
    rank: 3,
    name: "Lewis Hamilton",
    team: "Ferrari",
    number: "44",
    country: "Great Britain",
    imageTeam: "ferrari",
    imageCode: "lewham01",
    tone: "Fashion-week gravity with seven-title confidence.",
    source: "Ranker fan poll #3",
    profile: "https://www.formula1.com/en/drivers/lewis-hamilton"
  },
  {
    rank: 4,
    name: "Lando Norris",
    team: "McLaren",
    number: "1",
    country: "Great Britain",
    imageTeam: "mclaren",
    imageCode: "lannor01",
    tone: "Boyish charm, champion glow, and social-media horsepower.",
    source: "Ranker fan poll #4",
    profile: "https://www.formula1.com/en/drivers/lando-norris"
  },
  {
    rank: 5,
    name: "Pierre Gasly",
    team: "Alpine",
    number: "10",
    country: "France",
    imageTeam: "alpine",
    imageCode: "piegas01",
    tone: "French leading-man energy with a permanent soft-focus filter.",
    source: "Ranker fan poll #5",
    profile: "https://www.formula1.com/en/drivers/pierre-gasly"
  },
  {
    rank: 6,
    name: "George Russell",
    team: "Mercedes",
    number: "63",
    country: "Great Britain",
    imageTeam: "mercedes",
    imageCode: "georus01",
    tone: "Tall, polished, and always dressed like he knows the reservation name.",
    source: "Ranker fan poll #6",
    profile: "https://www.formula1.com/en/drivers/george-russell"
  },
  {
    rank: 7,
    name: "Oscar Piastri",
    team: "McLaren",
    number: "81",
    country: "Australia",
    imageTeam: "mclaren",
    imageCode: "oscpia01",
    tone: "Quiet confidence, clean-cut calm, zero wasted movement.",
    source: "Ranker fan poll #7",
    profile: "https://www.formula1.com/en/drivers/oscar-piastri"
  },
  {
    rank: 8,
    name: "Max Verstappen",
    team: "Red Bull Racing",
    number: "3",
    country: "Netherlands",
    imageTeam: "redbullracing",
    imageCode: "maxver01",
    tone: "The intensity does a lot of work, and somehow it works.",
    source: "Ranker fan poll #8",
    profile: "https://www.formula1.com/en/drivers/max-verstappen"
  },
  {
    rank: 9,
    name: "Oliver Bearman",
    team: "Haas F1 Team",
    number: "87",
    country: "Great Britain",
    imageTeam: "haas",
    imageCode: "olibea01",
    tone: "Rookie glow-up slot with big future-heartthrob upside.",
    source: "Social-buzz insert",
    profile: "https://www.formula1.com/en/drivers/oliver-bearman"
  },
  {
    rank: 10,
    name: "Franco Colapinto",
    team: "Alpine",
    number: "43",
    country: "Argentina",
    imageTeam: "alpine",
    imageCode: "fracol01",
    tone: "Argentine fanbase heat plus easy paddock charisma.",
    source: "2026 roster insert",
    profile: "https://www.formula1.com/en/drivers/franco-colapinto"
  },
  {
    rank: 11,
    name: "Kimi Antonelli",
    team: "Mercedes",
    number: "12",
    country: "Italy",
    imageTeam: "mercedes",
    imageCode: "andant01",
    tone: "Young-star shine, Mercedes polish, Italian main-character arc.",
    source: "Social-buzz insert",
    profile: "https://www.formula1.com/en/drivers/kimi-antonelli"
  },
  {
    rank: 12,
    name: "Nico Hulkenberg",
    team: "Audi",
    number: "27",
    country: "Germany",
    imageTeam: "audi",
    imageCode: "nichul01",
    tone: "Veteran cool, dry humor, underrated silver-fox lane.",
    source: "Ranker fan poll #9",
    profile: "https://www.formula1.com/en/drivers/nico-hulkenberg"
  },
  {
    rank: 13,
    name: "Alex Albon",
    team: "Williams",
    number: "23",
    country: "Thailand",
    imageTeam: "williams",
    imageCode: "alealb01",
    tone: "Friendly smile, sharp style, golden-retriever paddock aura.",
    source: "Ranker fan poll #12",
    profile: "https://www.formula1.com/en/drivers/alexander-albon"
  },
  {
    rank: 14,
    name: "Sergio Perez",
    team: "Cadillac",
    number: "11",
    country: "Mexico",
    imageTeam: "cadillac",
    imageCode: "serper01",
    tone: "Checo charm, loyal-fan magnetism, grown-man composure.",
    source: "Ranker fan poll #13",
    profile: "https://www.formula1.com/en/drivers/sergio-perez"
  },
  {
    rank: 15,
    name: "Valtteri Bottas",
    team: "Cadillac",
    number: "77",
    country: "Finland",
    imageTeam: "cadillac",
    imageCode: "valbot01",
    tone: "Mustache era, cycling calves, and total lack of embarrassment.",
    source: "Ranker fan poll #14",
    profile: "https://www.formula1.com/en/drivers/valtteri-bottas"
  },
  {
    rank: 16,
    name: "Esteban Ocon",
    team: "Haas F1 Team",
    number: "31",
    country: "France",
    imageTeam: "haas",
    imageCode: "estoco01",
    tone: "Tall, angular, serious-face Frenchman lane.",
    source: "Ranker fan poll #15",
    profile: "https://www.formula1.com/en/drivers/esteban-ocon"
  },
  {
    rank: 17,
    name: "Gabriel Bortoleto",
    team: "Audi",
    number: "5",
    country: "Brazil",
    imageTeam: "audi",
    imageCode: "gabbor01",
    tone: "Brazilian rookie energy with a clean, understated look.",
    source: "Social-buzz insert",
    profile: "https://www.formula1.com/en/drivers/gabriel-bortoleto"
  },
  {
    rank: 18,
    name: "Liam Lawson",
    team: "Racing Bulls",
    number: "30",
    country: "New Zealand",
    imageTeam: "racingbulls",
    imageCode: "lialaw01",
    tone: "No-nonsense Kiwi edge, quietly handsome, very race-focused.",
    source: "Social-buzz insert",
    profile: "https://www.formula1.com/en/drivers/liam-lawson"
  },
  {
    rank: 19,
    name: "Isack Hadjar",
    team: "Red Bull Racing",
    number: "6",
    country: "France",
    imageTeam: "redbullracing",
    imageCode: "isahad01",
    tone: "Intense rookie look, still building the off-track mythology.",
    source: "2026 roster insert",
    profile: "https://www.formula1.com/en/drivers/isack-hadjar"
  },
  {
    rank: 20,
    name: "Arvid Lindblad",
    team: "Racing Bulls",
    number: "41",
    country: "Great Britain",
    imageTeam: "racingbulls",
    imageCode: "arvlin01",
    tone: "Newest face on the grid, ranking still warming the tires.",
    source: "2026 roster insert",
    profile: "https://www.formula1.com/en/drivers/arvid-lindblad"
  },
  {
    rank: 21,
    name: "Fernando Alonso",
    team: "Aston Martin",
    number: "14",
    country: "Spain",
    imageTeam: "astonmartin",
    imageCode: "feralo01",
    tone: "The elder-statesman chaos charm remains deeply powerful.",
    source: "Custom placement",
    profile: "https://www.formula1.com/en/drivers/fernando-alonso"
  },
  {
    rank: 22,
    name: "Lance Stroll",
    team: "Aston Martin",
    number: "18",
    country: "Canada",
    imageTeam: "astonmartin",
    imageCode: "lanstr01",
    tone: "Low-drama confidence and billionaire ski-lodge styling.",
    source: "Custom placement",
    profile: "https://www.formula1.com/en/drivers/lance-stroll"
  }
];

const teamColors = {
  "Ferrari": "#e10600",
  "Williams": "#00a3e0",
  "McLaren": "#ff8000",
  "Alpine": "#ff87bc",
  "Mercedes": "#00d2be",
  "Red Bull Racing": "#3671c6",
  "Haas F1 Team": "#b6babd",
  "Audi": "#c4c4c4",
  "Aston Martin": "#006f62",
  "Cadillac": "#d8a545",
  "Racing Bulls": "#6692ff"
};

const sources = [
  {
    label: "Official F1 2026 driver roster",
    url: "https://www.formula1.com/en/drivers"
  },
  {
    label: "Ranker fan-voted attractiveness list",
    url: "https://www.ranker.com/list/hottest-formula-one-drivers/pedro-cerrano"
  },
  {
    label: "Sportscasting social following list",
    url: "https://www.sportscasting.com/uk/news/top-10-most-followed-f1-drivers-on-social-media/"
  },
  {
    label: "RaceFans social media directory",
    url: "https://www.racefans.net/f1-information/f1-social-media-directory/"
  }
];

const INTERNET_RANKING = drivers.map((driver) => driver.name);
const DRIVER_SET = new Set(INTERNET_RANKING);
const DRIVER_BY_NAME = new Map(drivers.map((driver) => [driver.name, driver]));
const FAN_RANKINGS_STORAGE_KEY = "f1-fan-rankings-v1";
const MAX_FAN_RANKINGS = 40;
const DELETE_PIN = "1700";

const fanFields = {
  form: $("#f1FanForm"),
  name: $("#f1FanName"),
  rows: $("#f1FanRows"),
  status: $("#f1FanStatus"),
  saved: $("#f1FanSaved"),
  savedCount: $("#f1FanSavedCount"),
  loadInternet: $("#f1LoadInternetRanking")
};

function normalizeNameKey(name) {
  return String(name || "").trim().toLowerCase();
}

function safeSavedEntries() {
  if (!window.localStorage) return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(FAN_RANKINGS_STORAGE_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];

    const cleaned = parsed
      .filter((entry) => entry && typeof entry.name === "string" && Array.isArray(entry.ranking))
      .filter((entry) => entry.ranking.length === INTERNET_RANKING.length)
      .filter((entry) => new Set(entry.ranking).size === INTERNET_RANKING.length)
      .filter((entry) => entry.ranking.every((name) => DRIVER_SET.has(name)))
      .map((entry) => ({
        id: String(entry.id || `${entry.name}-${entry.createdAt || Date.now()}`),
        name: entry.name.trim().slice(0, 40),
        ranking: entry.ranking.slice(),
        createdAt: Number(entry.createdAt) || Date.now()
      }))
      .filter((entry) => Boolean(entry.name))
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, MAX_FAN_RANKINGS);

    const deduped = [];
    const seenNames = new Set();
    cleaned.forEach((entry) => {
      const nameKey = normalizeNameKey(entry.name);
      if (!nameKey || seenNames.has(nameKey)) return;
      seenNames.add(nameKey);
      deduped.push(entry);
    });

    return deduped;
  } catch {
    return [];
  }
}

function writeSavedEntries(entries) {
  if (!window.localStorage) return;
  try {
    window.localStorage.setItem(FAN_RANKINGS_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Storage can be unavailable in private mode; UI still works for this session.
  }
}

function fanStatus(message, tone = "neutral") {
  if (!fanFields.status) return;
  fanFields.status.textContent = message;
  fanFields.status.dataset.tone = tone;
}

function driverTeamColor(driverName) {
  const team = DRIVER_BY_NAME.get(driverName)?.team;
  return teamColors[team] || "#f7f7f7";
}

function renderFanRows(order = INTERNET_RANKING) {
  if (!fanFields.rows) return;

  fanFields.rows.innerHTML = "";
  const fragment = document.createDocumentFragment();

  order.forEach((driverName, index) => {
    const row = document.createElement("article");
    row.className = "f1-fan-row";
    row.draggable = true;
    row.dataset.driver = driverName;
    row.style.setProperty("--fan-team-color", driverTeamColor(driverName));

    const rank = document.createElement("span");
    rank.className = "f1-fan-row__rank";
    rank.textContent = `#${index + 1}`;

    const name = document.createElement("strong");
    name.className = "f1-fan-row__name";
    name.textContent = driverName;

    const drag = document.createElement("span");
    drag.className = "f1-fan-row__drag";
    drag.textContent = "Drag";

    row.append(rank, name, drag);
    fragment.append(row);
  });

  fanFields.rows.append(fragment);
}

function rankingFromForm() {
  if (!fanFields.rows) return [];
  return [...fanFields.rows.querySelectorAll(".f1-fan-row")]
    .map((row) => row.dataset.driver)
    .filter(Boolean);
}

function clearFanDropTargets() {
  if (!fanFields.rows) return;
  fanFields.rows.querySelectorAll(".f1-fan-row.is-drop-target").forEach((row) => {
    row.classList.remove("is-drop-target");
  });
}

function updateFanRowRanks() {
  if (!fanFields.rows) return;
  [...fanFields.rows.querySelectorAll(".f1-fan-row")].forEach((row, index) => {
    const rank = row.querySelector(".f1-fan-row__rank");
    if (rank) rank.textContent = `#${index + 1}`;
  });
}

function rowAfterPointer(container, clientY) {
  const rows = [...container.querySelectorAll(".f1-fan-row:not(.is-dragging)")];
  return rows.reduce((closest, row) => {
    const box = row.getBoundingClientRect();
    const offset = clientY - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset, row };
    }
    return closest;
  }, { offset: Number.NEGATIVE_INFINITY, row: null }).row;
}

function setupFanDragAndDrop() {
  if (!fanFields.rows || fanFields.rows.dataset.dragReady === "true") return;
  fanFields.rows.dataset.dragReady = "true";

  fanFields.rows.addEventListener("dragstart", (event) => {
    const row = event.target.closest(".f1-fan-row");
    if (!row) return;
    row.classList.add("is-dragging");
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", row.dataset.driver || "");
    }
  });

  fanFields.rows.addEventListener("dragover", (event) => {
    const container = fanFields.rows;
    if (!container) return;
    event.preventDefault();

    const dragging = container.querySelector(".f1-fan-row.is-dragging");
    if (!dragging) return;

    const dropRow = rowAfterPointer(container, event.clientY);
    clearFanDropTargets();

    if (dropRow) {
      dropRow.classList.add("is-drop-target");
      container.insertBefore(dragging, dropRow);
    } else {
      container.append(dragging);
    }

    updateFanRowRanks();
  });

  fanFields.rows.addEventListener("drop", (event) => {
    event.preventDefault();
    clearFanDropTargets();
    updateFanRowRanks();
  });

  fanFields.rows.addEventListener("dragend", (event) => {
    const row = event.target.closest(".f1-fan-row");
    if (row) row.classList.remove("is-dragging");
    clearFanDropTargets();
    updateFanRowRanks();
  });
}

function validateRanking(ranking) {
  if (ranking.length !== INTERNET_RANKING.length) return "Please rank all drivers before saving.";
  if (ranking.some((name) => !DRIVER_SET.has(name))) return "One or more selected names are invalid.";
  if (new Set(ranking).size !== INTERNET_RANKING.length) return "Each driver can only be used once.";
  return "";
}

function formatSavedTime(timestamp) {
  const date = new Date(Number(timestamp) || Date.now());
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function renderSavedRankings(entries, onDelete = null) {
  if (!fanFields.saved || !fanFields.savedCount) return;

  fanFields.savedCount.textContent = `${entries.length} saved ranking${entries.length === 1 ? "" : "s"}`;

  if (!entries.length) {
    fanFields.saved.innerHTML = `
      <div class="f1-saved-empty">
        Save a name + ranking to start your fan leaderboard.
      </div>
    `;
    return;
  }

  fanFields.saved.innerHTML = "";
  entries.forEach((entry, index) => {
    const details = document.createElement("details");
    details.className = "f1-saved-entry";
    details.open = index === 0;

    const summary = document.createElement("summary");
    const left = document.createElement("div");
    left.className = "f1-saved-entry__summary-left";
    const name = document.createElement("strong");
    const time = document.createElement("span");
    name.textContent = entry.name;
    time.textContent = formatSavedTime(entry.createdAt);
    left.append(name, time);
    summary.append(left);

    if (onDelete) {
      const remove = document.createElement("button");
      remove.className = "f1-saved-entry__delete";
      remove.type = "button";
      remove.textContent = "Delete";
      remove.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        onDelete(entry);
      });
      summary.append(remove);
    }

    details.append(summary);

    const list = document.createElement("ol");
    list.className = "f1-saved-entry__list";
    entry.ranking.forEach((driverName, rankIndex) => {
      const item = document.createElement("li");
      const position = document.createElement("span");
      const label = document.createElement("strong");
      position.textContent = `#${rankIndex + 1}`;
      label.textContent = driverName;
      item.append(position, label);
      list.append(item);
    });

    details.append(list);
    fanFields.saved.append(details);
  });
}

function setupFanRanking() {
  if (!fanFields.form || !fanFields.name || !fanFields.rows || !fanFields.saved || !fanFields.savedCount || !fanFields.loadInternet) return;

  let savedEntries = safeSavedEntries();

  const dropSavedEntry = (entry) => {
    if (!entry || !entry.id) return;

    const enteredPin = window.prompt(`Enter the delete PIN to remove ${entry.name}'s ranking:`);
    if (enteredPin === null) return;

    if (String(enteredPin).trim() !== DELETE_PIN) {
      fanStatus("PIN did not match. Ranking was not deleted.", "error");
      return;
    }

    savedEntries = savedEntries.filter((savedEntry) => savedEntry.id !== entry.id);
    writeSavedEntries(savedEntries);
    renderSavedRankings(savedEntries, dropSavedEntry);
    fanStatus(`Deleted ${entry.name}'s ranking.`);
  };

  setupFanDragAndDrop();
  renderFanRows(INTERNET_RANKING);
  renderSavedRankings(savedEntries, dropSavedEntry);
  fanStatus("Drag names into your order, then save.");

  fanFields.loadInternet.addEventListener("click", () => {
    renderFanRows(INTERNET_RANKING);
    fanStatus("Internet ranking loaded.");
  });

  fanFields.form.addEventListener("reset", () => {
    window.setTimeout(() => {
      renderFanRows(INTERNET_RANKING);
      fanStatus("Ranking reset to internet order.");
    }, 0);
  });

  fanFields.form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = fanFields.name.value.trim();
    if (!name) {
      fanStatus("Type your name before saving.", "error");
      return;
    }

    const ranking = rankingFromForm();
    const validationError = validateRanking(ranking);
    if (validationError) {
      fanStatus(validationError, "error");
      return;
    }

    const trimmedName = name.slice(0, 40);
    const nameKey = normalizeNameKey(trimmedName);
    const existingIndex = savedEntries.findIndex((entry) => normalizeNameKey(entry.name) === nameKey);
    const existingEntry = existingIndex >= 0 ? savedEntries[existingIndex] : null;

    const entry = {
      id: existingEntry?.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: trimmedName,
      ranking,
      createdAt: Date.now()
    };

    const withoutName = savedEntries.filter((savedEntry) => normalizeNameKey(savedEntry.name) !== nameKey);
    savedEntries = [entry, ...withoutName].slice(0, MAX_FAN_RANKINGS);
    writeSavedEntries(savedEntries);
    renderSavedRankings(savedEntries, dropSavedEntry);
    fanStatus(`${existingEntry ? "Updated" : "Saved"} ${entry.name}'s ranking.`);
  });
}

function cardMarkup(driver, compact = false) {
  const color = teamColors[driver.team] || "#e10600";
  const profileUrl = driver.profile.endsWith("/") ? driver.profile : `${driver.profile}/`;
  const imageUrl = `https://media.formula1.com/image/upload/c_fill%2Cw_720/q_auto/v1740000001/common/f1/2026/${driver.imageTeam}/${driver.imageCode}/2026${driver.imageTeam}${driver.imageCode}right.webp`;
  const initials = driver.name.split(" ").map((part) => part[0]).join("").slice(0, 2);
  return `
    <article class="${compact ? "f1-card f1-card--podium" : "f1-card"}" style="--team-color: ${color}">
      <div class="f1-card__rank">#${driver.rank}</div>
      <div class="f1-card__portrait">
        <img src="${imageUrl}" alt="${driver.name} headshot" loading="lazy">
        <span aria-hidden="true">${initials}</span>
      </div>
      <div class="f1-card__body">
        <span class="f1-card__team">${driver.team}</span>
        <h3>${driver.name}</h3>
        <p>${driver.tone}</p>
      </div>
      <div class="f1-card__meta">
        <span>No. ${driver.number}</span>
        <span>${driver.country}</span>
        <span>${driver.source}</span>
      </div>
      <a class="f1-card__link" href="${profileUrl}" target="_blank" rel="noopener noreferrer" aria-label="Open ${driver.name}'s official Formula 1 driver profile">Driver profile</a>
    </article>
  `;
}

function render() {
  $("#f1Podium").innerHTML = drivers.slice(0, 3).map((driver) => cardMarkup(driver, true)).join("");
  $("#f1RankingGrid").innerHTML = drivers.map((driver) => cardMarkup(driver)).join("");
  $("#f1Count").textContent = `${drivers.length} active drivers`;
  $("#f1Sources").innerHTML = sources.map((source) => `
    <a href="${source.url}" target="_blank" rel="noopener">${source.label}</a>
  `).join("");
  setupFanRanking();
}

render();
