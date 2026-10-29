const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

export function onRequestGet() {
  return new Response(JSON.stringify({
    ok: true,
    generatedAt: new Date().toISOString()
  }), {
    headers: JSON_HEADERS
  });
}
