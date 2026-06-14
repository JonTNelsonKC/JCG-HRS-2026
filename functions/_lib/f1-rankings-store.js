const STORAGE_KEY = "f1-fan-rankings-v1";
const MAX_FAN_RANKINGS = 40;
const DEFAULT_DELETE_PIN = "1700";

const DRIVER_NAMES = [
  "Charles Leclerc",
  "Carlos Sainz",
  "Lewis Hamilton",
  "Lando Norris",
  "Pierre Gasly",
  "George Russell",
  "Oscar Piastri",
  "Max Verstappen",
  "Oliver Bearman",
  "Franco Colapinto",
  "Kimi Antonelli",
  "Nico Hulkenberg",
  "Alex Albon",
  "Sergio Perez",
  "Valtteri Bottas",
  "Esteban Ocon",
  "Gabriel Bortoleto",
  "Liam Lawson",
  "Isack Hadjar",
  "Arvid Lindblad",
  "Fernando Alonso",
  "Lance Stroll"
];

const DRIVER_SET = new Set(DRIVER_NAMES);

const memoryStore = globalThis.__F1_RANKINGS_MEMORY__
  || (globalThis.__F1_RANKINGS_MEMORY__ = { entries: [] });

function normalizeNameKey(name) {
  return String(name || "").trim().toLowerCase();
}

function createError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function createId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function sanitizeEntries(entries) {
  if (!Array.isArray(entries)) return [];

  const cleaned = entries
    .filter((entry) => entry && typeof entry.name === "string" && Array.isArray(entry.ranking))
    .filter((entry) => entry.ranking.length === DRIVER_NAMES.length)
    .filter((entry) => new Set(entry.ranking).size === DRIVER_NAMES.length)
    .filter((entry) => entry.ranking.every((name) => DRIVER_SET.has(name)))
    .map((entry) => ({
      id: String(entry.id || createId()),
      name: String(entry.name).trim().slice(0, 40),
      ranking: entry.ranking.slice(),
      createdAt: Number(entry.createdAt) || Date.now()
    }))
    .filter((entry) => Boolean(entry.name))
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, MAX_FAN_RANKINGS);

  const deduped = [];
  const seenNames = new Set();
  cleaned.forEach((entry) => {
    const key = normalizeNameKey(entry.name);
    if (!key || seenNames.has(key)) return;
    seenNames.add(key);
    deduped.push(entry);
  });

  return deduped;
}

function kvBinding(env) {
  const kv = env?.F1_RANKINGS;
  if (!kv) return null;
  return typeof kv.get === "function" && typeof kv.put === "function" ? kv : null;
}

function allowMemoryFallback(env) {
  return String(env?.F1_ALLOW_MEMORY_FALLBACK || "").trim() === "1";
}

async function readEntries(env = {}) {
  const kv = kvBinding(env);
  if (kv) {
    const value = await kv.get(STORAGE_KEY, "json");
    return sanitizeEntries(value);
  }
  if (!allowMemoryFallback(env)) {
    throw createError("Online store not configured. Add Cloudflare KV binding F1_RANKINGS.", 503);
  }
  return sanitizeEntries(memoryStore.entries);
}

async function writeEntries(env = {}, entries) {
  const cleaned = sanitizeEntries(entries);
  const kv = kvBinding(env);
  if (kv) {
    await kv.put(STORAGE_KEY, JSON.stringify(cleaned));
    return cleaned;
  }
  if (!allowMemoryFallback(env)) {
    throw createError("Online store not configured. Add Cloudflare KV binding F1_RANKINGS.", 503);
  }
  memoryStore.entries = cleaned;
  return cleaned;
}

function validateRanking(ranking) {
  if (!Array.isArray(ranking)) {
    throw createError("Ranking must be an array.");
  }
  if (ranking.length !== DRIVER_NAMES.length) {
    throw createError("Ranking must include all drivers.");
  }
  if (new Set(ranking).size !== DRIVER_NAMES.length) {
    throw createError("Each driver can only be ranked once.");
  }
  if (ranking.some((name) => !DRIVER_SET.has(name))) {
    throw createError("Ranking contains unknown driver names.");
  }
}

export async function listFanRankings(env = {}) {
  return readEntries(env);
}

export async function upsertFanRanking(env = {}, payload = {}) {
  const trimmedName = String(payload.name || "").trim().slice(0, 40);
  if (!trimmedName) throw createError("Name is required.");

  const ranking = Array.isArray(payload.ranking) ? payload.ranking.slice() : [];
  validateRanking(ranking);

  const entries = await readEntries(env);
  const nameKey = normalizeNameKey(trimmedName);
  const existing = entries.find((entry) => normalizeNameKey(entry.name) === nameKey);

  const nextEntry = {
    id: existing?.id || createId(),
    name: trimmedName,
    ranking,
    createdAt: Date.now()
  };

  const nextEntries = [
    nextEntry,
    ...entries.filter((entry) => normalizeNameKey(entry.name) !== nameKey)
  ].slice(0, MAX_FAN_RANKINGS);

  return writeEntries(env, nextEntries);
}

export async function removeFanRanking(env = {}, payload = {}) {
  const id = String(payload.id || "").trim();
  if (!id) throw createError("Ranking id is required.");

  const expectedPin = String(env?.F1_DELETE_PIN || DEFAULT_DELETE_PIN).trim();
  const providedPin = String(payload.pin || "").trim();
  if (providedPin !== expectedPin) {
    throw createError("PIN did not match.", 403);
  }

  const entries = await readEntries(env);
  const nextEntries = entries.filter((entry) => entry.id !== id);
  return writeEntries(env, nextEntries);
}
