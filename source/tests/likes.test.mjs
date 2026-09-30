import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import worker from '../likes-worker/index.js';

const origin = 'https://jingsong-wang.github.io';
const id = '01234567-89ab-4cde-8fab-0123456789ab';
function setup() {
  const db = new DatabaseSync(':memory:');
  db.exec(readFileSync(new URL('../likes-worker/schema.sql', import.meta.url), 'utf8'));
  const prepare = (sql, values = []) => ({
    bind: (...args) => prepare(sql, args),
    first: async () => db.prepare(sql).get(...values) ?? null,
    run: async () => db.prepare(sql).run(...values),
  });
  return { DB: { prepare }, close: () => db.close() };
}
function request(method = 'GET', body, extra = {}) {
  return new Request('https://likes.example/likes', { method,
    headers: { Origin: origin, 'X-Visitor-Id': id, 'CF-Connecting-IP': '192.0.2.1', 'Content-Type': 'application/json', ...extra },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}
test('likes are persistent, idempotent, and independently reversible', async () => {
  const env = setup();
  const send = async (method, body, headers) => (await worker.fetch(request(method, body, headers), env)).json();
  assert.deepEqual(await send('GET'), { count: 0, liked: false });
  assert.deepEqual(await send('PUT', { liked: true }), { count: 1, liked: true });
  assert.deepEqual(await send('PUT', { liked: true }), { count: 1, liked: true });
  assert.deepEqual(await send('GET'), { count: 1, liked: true });
  assert.deepEqual(await send('PUT', { liked: true }, { 'X-Visitor-Id': '11234567-89ab-4cde-8fab-0123456789ab' }), { count: 2, liked: true });
  assert.deepEqual(await send('PUT', { liked: false }), { count: 1, liked: false });
  assert.deepEqual(await send('PUT', { liked: false }), { count: 1, liked: false });
  env.close();
});
test('CORS, validation and database failures fail closed', async () => {
  const env = setup();
  assert.equal((await worker.fetch(request('OPTIONS'), env)).status, 204);
  assert.equal((await worker.fetch(request('PUT', { liked: true }, { Origin: 'https://evil.example' }), env)).status, 403);
  assert.equal((await worker.fetch(request('PUT', { liked: 'yes' }), env)).status, 400);
  assert.equal((await worker.fetch(request('PUT', { liked: true }, { 'X-Visitor-Id': 'bad' }), env)).status, 400);
  assert.equal((await worker.fetch(request('POST', {}), env)).status, 405);
  const response = await worker.fetch(request('GET'), {});
  assert.equal(response.status, 503);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), origin);
  env.close();
});
test('excessive updates are rate limited without increasing count', async () => {
  const env = setup();
  for (let i = 0; i < 20; i++) assert.equal((await worker.fetch(request('PUT', { liked: true }), env)).status, 200);
  const response = await worker.fetch(request('PUT', { liked: false }), env);
  assert.equal(response.status, 429);
  assert.ok(response.headers.get('Retry-After'));
  assert.deepEqual(await (await worker.fetch(request(), env)).json(), { count: 1, liked: true });
  env.close();
});
