// TEMPORARY -- INTENTIONAL BREAKAGE for CI/CD verification.
// Deliberately wrong return value so `playground` (which runs this
// exact file against 001's real test cases) genuinely fails, the
// same way the actual incident did. Purpose: confirm the Deploy
// Pages workflow_run gate (see .github/workflows/pages.yml) actually
// blocks deployment when this merges to main with CI red, replaying
// the original bug's merge pattern (branch protection's "skipped =
// passed" loophole, not yet closed in Settings > Branches at time of
// this test). REVERT THIS FILE once Deploy Pages is confirmed to
// have NOT fired for this merge -- see the accompanying revert
// script delivered alongside this one.
module.exports = function solve(c) {
  return false;
};

