// Bakes the problem corpus into problems.generated.json so the playground
// consumes the SAME problems as the CLI. Run: `node web/build.mjs`.
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const title = (md) => (md.match(/^#\s+(.+)$/m)?.[1] ?? "Untitled").trim();
const read = (p) => (existsSync(p) ? readFileSync(p, "utf8") : null);

function algoProblems() {
  const base = join(ROOT, "problems");
  return readdirSync(base).filter((d) => existsSync(join(base, d, "test_cases.json"))).sort().map((id) => {
    const dir = join(base, id);
    const md = read(join(dir, "problem.md")) || `# ${id}`;
    const languages = {};
    for (const lang of readdirSync(dir)) {
      const ld = join(dir, lang);
      const ext = { python: "py", javascript: "js", typescript: "ts", go: "go", java: "java", ruby: "rb", csharp: "cs" }[lang];
      if (!ext) continue;
      const cap = lang === "java" || lang === "csharp";
      const f = (v) => read(join(ld, (cap ? v[0].toUpperCase() + v.slice(1) : v) + "." + ext));
      languages[lang] = { practice: f("practice"), clean: f("clean"), optimized: f("optimized") };
    }
    return { id, track: "algorithm", title: title(md), statement: md,
             cases: JSON.parse(read(join(dir, "test_cases.json"))), languages };
  });
}

function dbProblems() {
  const base = join(ROOT, "problems-db");
  if (!existsSync(base)) return [];
  return readdirSync(base).filter((d) => existsSync(join(base, d, "schema.sql"))).sort().map((id) => {
    const dir = join(base, id);
    const md = read(join(dir, "problem.md")) || `# ${id}`;
    return { id, track: "database", title: title(md), statement: md,
             schema: read(join(dir, "schema.sql")), seed: read(join(dir, "seed.sql")),
             expected: JSON.parse(read(join(dir, "expected.json"))),
             practice: read(join(dir, "practice.sql")),
             solutions: { clean: read(join(dir, ".solutions", "clean.sql")), optimized: read(join(dir, ".solutions", "optimized.sql")) } };
  });
}

function feProblems() {
  const base = join(ROOT, "problems-fe");
  if (!existsSync(base)) return [];
  return readdirSync(base).filter((d) => existsSync(join(base, d, "assertions.json"))).sort().map((id) => {
    const dir = join(base, id);
    const md = read(join(dir, "problem.md")) || `# ${id}`;
    return { id, track: "frontend", title: title(md), statement: md,
             starter: read(join(dir, "starter.html")),
             assertions: JSON.parse(read(join(dir, "assertions.json"))),
             solutions: { clean: read(join(dir, ".solutions", "clean.html")) } };
  });
}

const corpus = { generatedAt: new Date().toISOString(), problems: [...algoProblems(), ...dbProblems(), ...feProblems()] };
writeFileSync(join(dirname(fileURLToPath(import.meta.url)), "problems.generated.json"), JSON.stringify(corpus, null, 2));
console.log(`baked ${corpus.problems.length} problems -> web/problems.generated.json`);
