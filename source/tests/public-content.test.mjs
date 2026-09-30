import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { profile, papers, projects, education, awards } from '../src/content.js';

test('favicon uses a font-independent W and the homepage red dot', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const icon = await readFile(new URL('../public/favicon-w.svg', import.meta.url), 'utf8');
  assert.match(html, /rel="icon" type="image\/svg\+xml" href="\/favicon-w.svg"/);
  assert.match(icon, /<title>W\.<\/title>/);
  assert.match(icon, /<path fill="#252525"/);
  assert.match(icon, /<circle[^>]+fill="#ab161b"/);
  assert.ok(!icon.includes('<text'));
});

test('reward playground links to its public site and describes local learning accurately', () => {
  const project = projects.find(item => item.codeUrl === 'https://github.com/jingsong-wang/reward-lab');
  assert.equal(project.websiteUrl, 'https://jingsong-wang.github.io/reward-lab/');
  assert.match(project.description, /tabular Q-learning running locally in the browser/);
  assert.match(project.description, /creative workshop/);
  assert.match(project.note, /not an LLM or physical robot demonstration/);
  assert.equal(projects.length, 4);
});

test('sticker challenge describes local CLIP classification with controls', () => {
  const project = projects.find(item => item.name === 'Sticker Challenge');
  assert.equal(project.websiteUrl, 'https://jingsong-wang.github.io/sticker-challenge/');
  assert.equal(project.codeUrl, 'https://github.com/jingsong-wang/sticker-challenge');
  assert.match(project.description, /CLIP locally in the browser/);
  assert.match(project.description, /blank-sticker controls/);
  assert.match(project.note, /not instruction following or an MLLM jailbreak/);
});

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
  assert.equal(defense.title, 'Reliable Safety Defenses');
  assert.equal(defense.venue, 'Jul-Sep 2026');
  assert.deepEqual(defense.authors, []);
  assert.equal(defense.paperUrl, null);
  assert.equal(defense.pdfUrl, null);
  assert.equal(defense.codeUrl, null);
});

test('public resources point to the supplied paper, account and independent project', () => {
  assert.equal(profile.email, 'jingsongwang@tongji.edu.cn');
  assert.equal(papers.length, 3);
  assert.deepEqual(papers.map(paper => paper.venue), ['Feb-May 2026', 'Jul-Sep 2026', 'Sep-Oct 2026 (expected) / In progress']);
  assert.ok(papers.every(paper => paper.paperUrl === null && paper.pdfUrl === null && paper.codeUrl === null && paper.authors.length === 0));
  assert.ok(!/arxiv|MMJailBench|2608\.25490/i.test(JSON.stringify(papers)));
  assert.equal(projects.find(project => project.name === 'FLYLAB').websiteUrl, 'https://jingsong-wang.github.io/fruit-fly/brain/');
  assert.equal(projects.find(project => project.name === 'FLYLAB').codeUrl, 'https://github.com/jingsong-wang/fruit-fly');
});

test('digital fly description reflects the current experiment and model boundaries', () => {
  assert.equal(projects.find(project => project.name === 'FLYLAB').subtitle, 'Interactive Digital Fly');
  assert.ok(!/pong/i.test(JSON.stringify(projects)));
  assert.match(projects.find(project => project.name === 'FLYLAB').description, /FlyWire/);
  assert.match(projects.find(project => project.name === 'FLYLAB').description, /MN9/);
  assert.match(projects.find(project => project.name === 'FLYLAB').note, /engineered/);
});

test('production metadata enables indexing at the correct canonical homepage', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.ok(html.includes('https://jingsong-wang.github.io/'));
  assert.ok(html.includes('Jingsong Wang | MLLM Safety'));
  assert.ok(!html.includes('noindex'));
});

test('image-scaling exhibit links to the verified project and states its scope', () => {
  const exhibit = projects.find(project => project.name === 'AI Flip Photo');
  assert.equal(exhibit.websiteUrl, 'https://jingsong-wang.github.io/ai-flip-photo/');
  assert.equal(exhibit.codeUrl, 'https://github.com/jingsong-wang/ai-flip-photo');
  assert.match(exhibit.description, /locally in the browser/);
  assert.match(exhibit.note, /no model inference/);
});
