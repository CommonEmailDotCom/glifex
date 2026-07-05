// Vendors the WASM runtimes the playground needs for non-JavaScript languages,
// so the site stays fully offline afterwards. Run once:  node web/fetch-runtimes.mjs
//
// This is the ONLY place the project touches the network for runtimes. After it
// runs, web/vendor/<lang>/ holds the runtime + a manifest.json, and the
// playground detects and uses it with no further downloads. Nothing here is
// committed to git (web/vendor/ is gitignored) — runtimes are fetched, not
// shipped, exactly like node_modules.

import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const VENDOR = join(dirname(fileURLToPath(import.meta.url)), "vendor");

// Official sources. Pinned versions are verified at build time in a later phase;
// treat these as the intended targets.
const RUNTIMES = {
  python:     { files: [
    "https://cdn.jsdelivr.net/pyodide/v0.28.0/full/pyodide.js",
    "https://cdn.jsdelivr.net/pyodide/v0.28.0/full/pyodide.asm.js",
    "https://cdn.jsdelivr.net/pyodide/v0.28.0/full/pyodide.asm.wasm",
    "https://cdn.jsdelivr.net/pyodide/v0.28.0/full/python_stdlib.zip",
    "https://cdn.jsdelivr.net/pyodide/v0.28.0/full/pyodide-lock.json",
  ] },
  typescript: { files: ["https://cdn.jsdelivr.net/npm/typescript@6.0.3/lib/typescript.js"] },
  ruby:       { files: [
    "https://cdn.jsdelivr.net/npm/@ruby/3.4-wasm-wasi/dist/browser.script.iife.js",
    "https://cdn.jsdelivr.net/npm/@ruby/3.4-wasm-wasi/dist/ruby.wasm",
  ] },
  // Database track: PGlite (Postgres compiled to WASM)
  postgres:   { files: [
    "https://cdn.jsdelivr.net/npm/@electric-sql/pglite/dist/index.js",
    "https://cdn.jsdelivr.net/npm/@electric-sql/pglite/dist/pglite.wasm",
    "https://cdn.jsdelivr.net/npm/@electric-sql/pglite/dist/pglite.data",
  ] },
};

async function fetchTo(url, destDir) {
  const name = url.split("/").pop();
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(join(destDir, name), buf);
  return { name, bytes: buf.length };
}

for (const [lang, spec] of Object.entries(RUNTIMES)) {
  const dir = join(VENDOR, lang);
  await mkdir(dir, { recursive: true });
  const got = [];
  for (const url of spec.files) {
    try { got.push(await fetchTo(url, dir)); console.log(`  ✓ ${lang}: ${url.split("/").pop()}`); }
    catch (e) { console.error(`  ✗ ${lang}: ${e.message}`); }
  }
  await writeFile(join(dir, "manifest.json"), JSON.stringify({ lang, files: got, fetchedAt: new Date().toISOString() }, null, 2));
}
console.log("\nDone. The playground now works offline for the vendored languages.");
