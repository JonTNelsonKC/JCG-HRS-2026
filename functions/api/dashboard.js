import { buildDashboard } from "../_lib/nascar-data.js";

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: JSON_HEADERS
  });
}

export async function onRequestGet() {
  try {
    return json(await buildDashboard());
  } catch (error) {
    return json({ ok: false, error: error.message }, 500);
  }
}
