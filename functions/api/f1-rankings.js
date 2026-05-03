import {
  listFanRankings,
  removeFanRanking,
  upsertFanRanking
} from "../_lib/f1-rankings-store.js";

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

function errorResponse(error) {
  return json({
    ok: false,
    error: error.message || "Request failed"
  }, Number(error.status) || 500);
}

async function parseBody(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export async function onRequestGet(context) {
  try {
    const entries = await listFanRankings(context.env);
    return json({ ok: true, entries });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function onRequestPost(context) {
  try {
    const body = await parseBody(context.request);
    const entries = await upsertFanRanking(context.env, body);
    return json({ ok: true, entries });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function onRequestDelete(context) {
  try {
    const body = await parseBody(context.request);
    const entries = await removeFanRanking(context.env, body);
    return json({ ok: true, entries });
  } catch (error) {
    return errorResponse(error);
  }
}

