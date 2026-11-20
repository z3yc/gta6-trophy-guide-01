// Leonida Trophy Guide — the program that hands the guide in.
//
// The guide itself is plain static files in app/ (index.html, its module, stylesheet and
// data), so any static server can host it and a browser opens it with the network off.
// This program only delivers it: it copies app/ and screenshots/ from next to this file
// into the output directory and writes dossier.json there, the summary the judge reads
// (the screenshots, the first load's files and bytes, and the source), built with the
// vendored make.fun library. Leave vendor/makefun-frontend.ts untouched: the scorer
// rebuilds the dossier with its own identical copy and the two must match byte for byte.
//
// Run it from the repository root with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output; inside the grader the
// program writes to /output. It uses only the Node standard library, so nothing needs
// to be installed first, and it writes the same bytes on every run.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The repository root is the directory this file lives in.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Fresh output directory, then the guide and its screenshots, copied whole.
// Fail loudly instead of handing in an empty entry if app/ is missing.
if (!existsSync(join(repoRoot, 'app', 'index.html'))) {
  throw new Error(`app/index.html not found next to main.ts (looked in ${join(repoRoot, 'app')})`);
}
mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The scorer's caps, from the kit's gate: the text budget shapes the dossier's bytes,
// the others refuse an entry the scorer would refuse anyway (at most 4 screenshots,
// each at most 256 KiB; at most 993 files and directories in app/, at most 48 MiB of
// app files — app/ shares /output's own 1000-entry cap with screenshots/ and dossier.json).
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
