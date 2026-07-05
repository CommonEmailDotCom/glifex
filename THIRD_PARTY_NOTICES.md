# Third-Party Notices

Glifex itself is MIT licensed (see LICENSE). This file covers third-party
software that glifex.dev **distributes** when the in-browser WASM tier is
enabled via `node web/fetch-runtimes.mjs`.

> Status: the WASM tier is **not yet deployed**. The projects below are the
> intended runtimes; exact versions and any bundled sub-licenses will be
> recorded here in the same commit that first vendors them.

| Project | Purpose | License |
|---|---|---|
| Pyodide | Python in the browser (CPython on WASM) | MPL-2.0 |
| TypeScript (compiler) | In-browser TS → JS compilation | Apache-2.0 |
| ruby.wasm | Ruby in the browser (CRuby on WASM) | Ruby License / BSD-2-Clause |
| PGlite (ElectricSQL) | PostgreSQL in the browser (WASM) | Apache-2.0 |

Each project's full license text ships alongside its vendored files under
`web/vendor/<name>/` once distributed. Nothing else on glifex.dev embeds
third-party runtime code; the site's own HTML/CSS/JS is original and MIT.
