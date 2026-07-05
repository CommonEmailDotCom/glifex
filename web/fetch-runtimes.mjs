// Vendors the WASM runtimes for non-JavaScript playground languages, so the
// site stays fully offline-capable afterwards. Run once locally, and in the
// Pages build:  node web/fetch-runtimes.mjs
//
// This is the ONLY place the project touches the network for runtimes.
// web/vendor/ is gitignored — runtimes are fetched, never committed.
//
// Design: some dist filenames vary across releases, so each runtime lists
// CANDIDATE files; 404s on alternates are fine as long as one required set
// lands. Every runtime's LICENSE is fetched alongside (see
// THIRD_PARTY_NOTICES.md), and VERSIONS.json records exactly what shipped.

import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const VENDOR = join(dirname(fileURLToPath(import.meta.url)), "vendor");
const CDN = "https://cdn.jsdelivr.net";

const RUNTIMES = {
  typescript: {
    version: "6.0.3", license: "Apache-2.0",
    files: [
      { url: `${CDN}/npm/typescript@6.0.3/lib/typescript.js`, required: true },
      { url: `${CDN}/npm/typescript@6.0.3/LICENSE.txt`, save: "LICENSE", required: true },
    ],
  },
  python: {
    version: "0.28.0", license: "MPL-2.0",
    files: [
      { url: `${CDN}/pyodide/v0.28.0/full/pyodide.js`, required: true },
      { url: `${CDN}/pyodide/v0.28.0/full/pyodide.asm.js`, required: true },
      { url: `${CDN}/pyodide/v0.28.0/full/pyodide.asm.wasm`, required: true },
      { url: `${CDN}/pyodide/v0.28.0/full/python_stdlib.zip`, required: true },
      { url: `${CDN}/pyodide/v0.28.0/full/pyodide-lock.json`, required: true },
      { url: `${CDN}/npm/pyodide@0.28.0/LICENSE`, save: "LICENSE" },
    ],
  },
  ruby: {
    version: "3.4", license: "Ruby / BSD-2-Clause",
    files: [
      { url: `${CDN}/npm/@ruby/3.4-wasm-wasi/dist/browser.script.iife.js`, required: true },
      // The harness does `require "json"` — we need the STDLIB build.
      // Filename varies by release; try candidates, keep whichever exists.
      { url: `${CDN}/npm/@ruby/3.4-wasm-wasi/dist/ruby+stdlib.wasm`, save: "ruby+stdlib.wasm", group: "rubywasm" },
      { url: `${CDN}/npm/@ruby/3.4-wasm-wasi/dist/ruby.wasm`, save: "ruby+stdlib.wasm", group: "rubywasm" },
      { url: `${CDN}/npm/@ruby/3.4-wasm-wasi/LICENSE`, save: "LICENSE" },
    ],
  },
  postgres: {
    version: "latest", license: "Apache-2.0",
    files: [
      { url: `${CDN}/npm/@electric-sql/pglite/dist/index.js`, required: true },
      // wasm/data asset names have varied across PGlite releases — candidates:
      { url: `${CDN}/npm/@electric-sql/pglite/dist/pglite.wasm`, group: "pgwasm" },
      { url: `${CDN}/npm/@electric-sql/pglite/dist/postgres.wasm`, group: "pgwasm" },
      { url: `${CDN}/npm/@electric-sql/pglite/dist/pglite.data`, group: "pgdata" },
      { url: `${CDN}/npm/@electric-sql/pglite/dist/postgres.data`, group: "pgdata" },
      { url: `${CDN}/npm/@electric-sql/pglite/LICENSE`, save: "LICENSE" },
    ],
  },
};

async function fetchTo(url, destDir, saveAs) {
  const name = saveAs || url.split("/").pop();
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(join(destDir, name), buf);
  return { name, url, bytes: buf.length };
}

const summary = {};
let failed = false;
for (const [lang, spec] of Object.entries(RUNTIMES)) {
  const dir = join(VENDOR, lang);
  await mkdir(dir, { recursive: true });
  const got = [];
  const groupsSatisfied = new Set();
  for (const f of spec.files) {
    if (f.group && groupsSatisfied.has(f.group)) continue;   // alternate already landed
    try {
      const r = await fetchTo(f.url, dir, f.save);
      got.push(r);
      if (f.group) groupsSatisfied.add(f.group);
      console.log(`  ✓ ${lang}: ${r.name} (${(r.bytes / 1024).toFixed(0)} KB)`);
    } catch (e) {
      const note = f.group ? "(candidate — trying alternate)" : f.required ? "(REQUIRED)" : "(optional)";
      console.log(`  ✗ ${lang}: ${f.url.split("/").pop()} ${e.message} ${note}`);
      if (f.required) failed = true;
    }
  }
  const groups = [...new Set(spec.files.filter((f) => f.group).map((f) => f.group))];
  for (const g of groups) if (!groupsSatisfied.has(g)) { console.log(`  ✗ ${lang}: no candidate satisfied '${g}'`); failed = true; }
  await writeFile(join(dir, "manifest.json"),
    JSON.stringify({ lang, version: spec.version, license: spec.license, files: got, fetchedAt: new Date().toISOString() }, null, 2));
  summary[lang] = { version: spec.version, license: spec.license, files: got.map((f) => f.name) };
}
await writeFile(join(VENDOR, "VERSIONS.json"), JSON.stringify(summary, null, 2));
console.log(`\n${failed ? "INCOMPLETE — see ✗ lines above" : "Done"}. web/vendor/VERSIONS.json records what shipped (use it to amend THIRD_PARTY_NOTICES.md).`);
process.exit(failed ? 1 : 0);
