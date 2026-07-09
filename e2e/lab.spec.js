// L1 -- Complexity Lab smoke. Proves the whole lab path end to end on the
// zero-install JavaScript track: generators -> oracle -> runner -> fitter ->
// verdict card. False-green guard: waits for a .lab-verdict to APPEAR, then
// asserts the upper-bound line is a real verdict (consistent), not an error
// card -- a broken engine or a correctness-gate trip cannot fake a pass.
const { test, expect } = require("@playwright/test");

// A correct one-pass two-sum: O(n) worst, early exit on the easy family --
// exactly the shape the declared bounds in lab-config.mjs describe.
const JS_TWO_SUM = `module.exports = function solve(input) {
  const seen = new Map();
  for (let i = 0; i < input.nums.length; i++) {
    const need = input.target - input.nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(input.nums[i], i);
  }
  return [-1, -1];
};`;

test("Complexity Lab renders a verdict card (JavaScript, Two Sum)", async ({ page }) => {
  page.on("pageerror", (e) => console.error("[pageerror]", e.message));
  await page.goto("http://localhost:8080/");
  await expect(page.locator("#problem-list li").first()).toBeVisible();
  await page.locator('#problem-list li:has-text("Two Sum")').click();
  await expect(page.locator("#lab-btn")).toBeVisible();

  await page.evaluate((src) => {
    if (window.GlifexEditor) GlifexEditor.setValue(src);
    else document.getElementById("editor").value = src;
  }, JS_TWO_SUM);

  const verdicts = page.locator("#lab .lab-verdict");

  // Wall-tier timing is a REAL measurement, not a simulation -- genuine
  // JIT/GC noise can occasionally produce a spurious refutation on an
  // otherwise-correct solution (tracked: the wall-tier DCE/JIT-noise known
  // issue, docs/ROADMAP.md's L1 entry). Clicking Analyze again re-samples
  // fresh wall-clock timing (the input DATA is seeded/deterministic; the
  // TIMING is not), so one retry absorbs a single bad draw of measurement
  // noise without weakening what this test actually proves: a STRUCTURAL
  // break (broken engine, a tripped correctness gate, a missing oracle)
  // fails on EVERY attempt, since it isn't timing-dependent.
  let text = "";
  for (let attempt = 1; attempt <= 2; attempt++) {
    await page.locator("#lab-btn").click();
    await expect(verdicts.first()).toBeVisible({ timeout: 60000 });
    await expect(verdicts.first()).toContainText(/Upper bound O\(n\)/, { timeout: 60000 });
    text = await verdicts.first().textContent();
    if (/consistent/i.test(text)) break;
    if (attempt === 1) console.log("[lab.spec.js] attempt 1 was not consistent (wall-tier timing noise) -- retrying once:", text);
  }
  expect(text).toMatch(/consistent/i);

  // The proof table and chart rendered.
  await expect(page.locator("#lab .lab-table")).toBeVisible();
  await expect(page.locator("#lab svg")).toBeVisible();
});
