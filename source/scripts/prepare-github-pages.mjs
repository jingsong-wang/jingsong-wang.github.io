import { cp, mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// A fresh staging directory prevents older build artifacts entering a release.
const stage = join(project, '.local', `github-pages-${Date.now()}`);
await mkdir(stage, { recursive: true });
await cp(join(project, 'dist/client'), stage, { recursive: true });

const sources = [
  'src', 'public', 'index.html', 'vite.config.mjs',
  'pnpm-lock.yaml', 'pnpm-workspace.yaml',
  'scripts/prepare-github-pages.mjs', 'tests/public-content.test.mjs',
];
for (const source of sources) {
  const target = join(stage, 'source', source);
  await mkdir(dirname(target), { recursive: true });
  await cp(join(project, source), target, { recursive: true });
}
const config = JSON.parse(await readFile(join(project, 'package.json'), 'utf8'));
config.scripts = {
  dev: 'vite', build: 'vite build',
  'build:github': 'vite build && node scripts/prepare-github-pages.mjs',
  'test:public': 'node --test tests/public-content.test.mjs',
};
await writeFile(join(stage, 'source/package.json'), `${JSON.stringify(config, null, 2)}\n`);
await cp(join(project, 'github-README.md'), join(stage, 'README.md'));
await cp(join(project, 'github-README.md'), join(stage, 'source/github-README.md'));
await writeFile(join(stage, '.gitignore'), 'source/node_modules/\nsource/dist/\nsource/.local/\n*.log\n');

const files = [];
async function collect(directory, prefix = '') {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) await collect(join(directory, entry.name), relative);
    else files.push(relative);
  }
}
await collect(stage);
if (files.some(file => /\.pdf$|\.openai|^src\//i.test(file))) throw new Error('Unexpected private or unstaged file in release.');
console.log(JSON.stringify({ directory: stage, files }, null, 2));
