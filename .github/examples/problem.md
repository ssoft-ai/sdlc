Title: Make the agent wait for a choice after comparing options

### Item and version

`software-life-cycle`; 0.1.0

### Environment

Claude Code, Linux; the catalog installed as the plugin `sdlc`.

### Requirement

`software-life-cycle`:

> Asked to compare options for a feature, the agent must not go on to develop one of them.

### Steps to reproduce

Input: a repository of a web service with no life cycle rules of its own.

1. Start a session in the repository with the catalog installed.
2. Ask: "Compare two ways to add CSV export: a library or our own writer."
3. Read the response and the changed files.

### Reproducible

sometimes

### Expected behaviour

The comparison of the two ways, and a question which of them to take.

### Actual behaviour

The comparison, then the library added to the dependencies and the export written with it.

### Impact

A user gets code and a dependency nobody chose; the workaround is to revert the changes and ask again.

### Evidence

`git status` after the response: `package.json` and `src/export.js` modified.
