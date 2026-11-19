// Leonida Trophy Guide — the entry program for make.fun's gta6-trophy-guide-01 bounty.
// Node 22, standard library only. It copies this directory's app/ and screenshots/ to /output and
// writes /output/dossier.json with the vendored make.fun library, so the judge can read the guide.
// vendor/makefun-frontend.ts is the kit's copy, unchanged: the scorer requires the dossier to be
// byte for byte what its own copy writes.
//
// Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// (Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output.)
// Serve the guide locally with `node serve.ts`, then open http://localhost:8080.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The guide refuses to hand in a dossier if the app itself did not make it to /output:
// a missing app/index.html means the copy failed, and a silent bad dossier is worse than a loud stop.
mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
if (!existsSync(join(out, 'app', 'index.html'))) {
  throw new Error('app/index.html did not reach /output — refusing to write a dossier');
}
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others
// refuse an entry the scorer would refuse (more than 4 screenshots or one over 256 KiB; more than
// 993 files and directories in app/ or 48 MiB of app files: app/ counts beside /output's own
// 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
