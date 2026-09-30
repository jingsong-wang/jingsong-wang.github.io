const ORIGIN = 'https://jingsong-wang.github.io';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
async function hash(value) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}
export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', Vary: 'Origin',
      ...(origin === ORIGIN ? { 'Access-Control-Allow-Origin': ORIGIN } : {}) };
    const json = (data, status = 200, extra = {}) => new Response(JSON.stringify(data), { status, headers: { ...headers, ...extra } });
    if (new URL(request.url).pathname !== '/likes') return json({ error: 'Not found' }, 404);
    if (origin !== ORIGIN) return json({ error: 'Origin not allowed' }, 403);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...headers,
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, X-Visitor-Id', 'Access-Control-Max-Age': '86400' } });
    if (!['GET', 'PUT'].includes(request.method)) return json({ error: 'Method not allowed' }, 405);
    const token = request.headers.get('X-Visitor-Id') || '';
    if (token && !UUID.test(token)) return json({ error: 'Invalid visitor' }, 400);
    if (request.method === 'PUT' && !token) return json({ error: 'Visitor required' }, 400);
    try {
      const visitor = token ? await hash(token) : '';
      if (request.method === 'PUT') {
        if (!request.headers.get('Content-Type')?.startsWith('application/json')) return json({ error: 'JSON required' }, 415);
        // Read at most 512 bytes even if Content-Length is missing or untrusted.
        const reader = request.body?.getReader();
        let text = '', size = 0;
        const decoder = new TextDecoder();
        if (!reader) return json({ error: 'Body required' }, 400);
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > 512) { await reader.cancel(); return json({ error: 'Body too large' }, 413); }
          text += decoder.decode(value, { stream: true });
        }
        let body;
        try { body = JSON.parse(text + decoder.decode()); } catch { return json({ error: 'Invalid JSON' }, 400); }
        if (typeof body?.liked !== 'boolean') return json({ error: 'Boolean liked required' }, 400);
        const minute = Math.floor(Date.now() / 60000);
        const ip = request.headers.get('CF-Connecting-IP');
        if (!ip) return json({ error: 'Client address unavailable' }, 503);
        const key = await hash(`${minute}:${ip}`);
        const rate = await env.DB.prepare('INSERT INTO rate_limits (key, hits, expires) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET hits = hits + 1 RETURNING hits').bind(key, minute + 2).first();
        if (rate.hits > 20) return json({ error: 'Please wait before trying again' }, 429, { 'Retry-After': '60' });
        await env.DB.prepare('DELETE FROM rate_limits WHERE expires < ?').bind(minute).run();
        // A unique visitor key makes retries idempotent, including lost responses.
        if (body.liked) await env.DB.prepare('INSERT OR IGNORE INTO likes (visitor, created_at) VALUES (?, ?)').bind(visitor, Date.now()).run();
        else await env.DB.prepare('DELETE FROM likes WHERE visitor = ?').bind(visitor).run();
      }
      const result = await env.DB.prepare('SELECT COUNT(*) AS count, EXISTS(SELECT 1 FROM likes WHERE visitor = ?) AS liked FROM likes').bind(visitor).first();
      return json({ count: result.count, liked: Boolean(result.liked) });
    } catch {
      return json({ error: 'Likes temporarily unavailable' }, 503);
    }
  },
};
