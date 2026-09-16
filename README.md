# Jingsong Wang's Academic Homepage

Live site: https://jingsong-wang.github.io/

Personal academic homepage of Jingsong Wang (王敬淞), a graduate student at Tongji University studying multimodal large language model safety.

## Editing

The editable React application is in `source/`. Profile data, education, awards, publications, and project links are in `source/src/content.js`. Unknown dates and unavailable resources are omitted.

```sh
cd source
pnpm install
pnpm dev
pnpm test:public
pnpm build:github
```

The export command prints a fresh `.local/github-pages-*` directory containing both the static website and its editable source. Publish that directory's contents to the repository root, retaining this repository's LICENSE and commit history. GitHub Pages uses the `master` branch root; `.nojekyll` keeps the built assets unchanged. No application server is required.

## Public Sources

- MMJailBench: https://arxiv.org/abs/2608.25490
- FLYLAB code and model boundaries: https://github.com/jingsong-wang/fruit-fly
- FLYLAB digital fly: https://jingsong-wang.github.io/fruit-fly/brain/
- Education, contact details, and awards were supplied by the site owner.

The defense entry intentionally contains only a general research overview. Do not add private manuscript metadata or files without the owner's explicit instruction.

The original placeholder homepage remains recoverable in Git history. Its inherited MIT license is retained. The fruit-fly project is independently hosted from its own repository.
