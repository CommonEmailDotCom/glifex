# AGENTS.md — working in this repo as an AI assistant

Rules for Claude, Cursor, Copilot, and similar tools operating on Glifex.

## The contract

- **Algorithm problems**: implement a single function in `practice.<ext>`.
  - Python: `def solve(case): ...`
  - JavaScript: `module.exports = function solve(c) { ... }`
  - TypeScript: `export function solve(c: any) { ... }`
  - Go: `func practice(c map[string]any) any { ... }`
  - Ruby: `def solve(c) ... end`
  - Java: `class Practice implements Solution { public Object solve(Map<String,Object> c) ... }`
  - C#: `class Practice : ISolution { public object Solve(Dictionary<string,object> c) ... }`
- Inputs match the `input` object in the problem's `test_cases.json`. The harness
  handles all I/O, parsing, and comparison — **do not** read files or print in the
  solution file.
- **Database problems**: write SQL in `practice.sql` against the given `schema.sql`
  / `seed.sql`; the expected result set is `expected.json`.

## How to verify your work

```bash
python3 glifex.py test <problem> <language>     # algorithm
python3 glifex.py db test <problem>             # database (SQLite)
```

Do not claim a solution works until `glifex test` passes for it.

## Blind-practice etiquette

- **Do not open or read `clean.*`, `optimized.*`, or `.solutions/` unless the user
  explicitly asks.** They are hidden on purpose so the user can practice cold.
- If asked to compare, use `glifex reveal <problem> <language> <variant>`.

## Adding things

- New problem: `glifex new <id>` (algorithm) or `glifex new-db <id>` (database).
- New language: add `languages/<name>.toml` + a harness template. Never hardcode
  language names in `glifex.py` — the registry is the source of truth.

## Honesty

- If a language's toolchain isn't installed, say so (`glifex doctor`) rather than
  guessing at output.
- Cross-language nanosecond benchmarks are not meaningful; compare within a language.
- See `STATUS.md` for what is verified vs written-but-unverified.
