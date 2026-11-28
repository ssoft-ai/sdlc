Title: Run the checks on every pull request

### Requested item

A pipeline running `node scripts/ci/check.js`.

### Description

GitHub Actions runs the checks when a pull request into `dev` or `main` is opened or updated and reports the result as the status check `checks`; the protection of `dev` and `main` requires it.

### Justification

The checks run only where a contributor runs them, so nothing stops a merge with a failing check.

### Scope

The pull requests into `dev` and `main`. The evals stay out of the pipeline.

### Acceptance criteria

- [ ] Given a pull request into `dev`, when it is opened or updated, then the status check `checks` reports the result of `node scripts/ci/check.js`
- [ ] Given that check failed, when the pull request is merged, then the protection of `dev` refuses the merge
