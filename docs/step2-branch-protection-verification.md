# Branch protection gate verification (step 2)

This file exists to give this PR something to commit, on purpose --
it doesn't fix or further break anything. Main is already broken
right now (001-anagram-detection's JS practice.js still has the
deliberate `return false;` from the Deploy Pages gate test), and this
PR deliberately leaves that alone so CI fails on this branch the same
way it already has been: `playground` red, `e2e` skipped,
`ci-status-gate` red.

What's different this time is what branch protection is pointed at.
Step 1 proved the Deploy Pages fix works. Step 2 is testing whether
branch protection's REQUIRED status check has been switched from
`e2e` to `ci-status-gate` in Settings > Branches.

- If it has: this PR should NOT merge. `ci-status-gate` fails for
  real (not skipped -- it runs unconditionally via `if: always()` and
  explicitly checks every job's result), and a genuinely failed
  required check blocks merge outright. Auto-merge will sit here
  enabled but permanently pending, since the thing it's waiting on
  will never turn green while this PR exists.
- If it hasn't: this PR will merge anyway, exactly like the original
  incident and exactly like the Deploy Pages test -- because `e2e`
  still gets skipped when `playground` fails, and a skipped required
  check still satisfies branch protection.

Either outcome is a real, meaningful result. Delete this file (or
just let the whole PR get closed unmerged) once verified.
