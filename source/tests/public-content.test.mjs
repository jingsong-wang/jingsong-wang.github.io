import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { profile, papers, projects, education, awards } from '../src/content.js';

test('education dates and award updates match the supplied profile', () => {
  assert.deepEqual(education.map(item => item.dates), ['2026-present', '2022-2026']);
  assert.equal(education[1].status, 'Outstanding graduate');
  assert.equal(awards.length, 6);
  assert.ok(awards.every(award => /202[345]/.test(award.context)));
  assert.match(awards[1].context, /Nanjing Regional \(2025\).*Shenyang Regional \(2024\)/);
  assert.equal(awards[5].detail, 'First Prize');
  assert.equal(awards[5].context, 'National Final / 2023');
});

test('anonymous defense research has no public manuscript metadata or links', () => {
  const defense = papers.find(paper => paper.id === 'defense');
  assert.equal(defense.title, 'Multimodal safety defenses');
  assert.equal(defense.venue, 'Ongoing research');
  assert.deepEqual(defense.authors, []);
  assert.equal(defense.paperUrl, null);
  assert.equal(defense.pdfUrl, null);
  assert.equal(defense.codeUrl, null);
});

test('public resources point to the supplied paper, account and independent project', () => {
  assert.equal(profile.email, 'jingsongwang@tongji.edu.cn');
  assert.equal(papers[0].paperUrl, 'https://arxiv.org/abs/2608.25490');
  assert.equal(projects[0].websiteUrl, 'https://jingsong-wang.github.io/fruit-fly/brain/');
  assert.equal(projects[0].codeUrl, 'https://github.com/jingsong-wang/fruit-fly');
});

test('digital fly description reflects the current experiment and model boundaries', () => {
  assert.equal(projects[0].subtitle, 'Interactive Digital Fly');
  assert.ok(!/pong/i.test(JSON.stringify(projects)));
  assert.match(projects[0].description, /FlyWire/);
  assert.match(projects[0].description, /MN9/);
  assert.match(projects[0].note, /engineered/);
});

test('production metadata enables indexing at the correct canonical homepage', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.ok(html.includes('https://jingsong-wang.github.io/'));
  assert.ok(html.includes('Jingsong Wang | MLLM Safety'));
  assert.ok(!html.includes('noindex'));
});
