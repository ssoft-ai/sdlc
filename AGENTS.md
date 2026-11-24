# AGENTS.md - SDLC

SDLC is a catalog of skills in the open Agent Skills format that carries an agent through
software development the way the industry standards describe it.

An agent working in this repository should follow `CONTRIBUTING.md`.

## Map

`<name>` stands for the name of a skill, `<case>` for the name of an eval case.

| Folder | Holds |
|---|---|
| the root | `README.md`, `CONTRIBUTING.md`, `AGENTS.md`, `CHANGELOG.md`, `LICENSE.md` and `.gitignore` |
| `.claude-plugin/` | the plugin manifest of Claude Code |
| `.github/` | `pull_request_template.md`, the template of a pull request |
| `.github/ISSUE_TEMPLATE/` | the issue forms of GitHub: for a problem, an enhancement and a release |
| `.github/examples/` | a filled example of each issue form and of the pull request template, and what each part of a pull request holds |
| `.github/workflows/` | the pipeline running the checks on every pull request into `dev` or `main` |
| `skills/` | the skills of the catalog, a folder for each |
| `skills/<name>/` | a skill: its `SKILL.md` |
| `skills/<name>/references/` | the files `SKILL.md` of the skill refers to |
| `evals/` | the eval cases, a folder for each skill that has eval cases, and, after a run, `results/` |
| `evals/<name>/` | the eval cases of a skill, a folder for each |
| `evals/<name>/<case>/` | an eval case: its prompt in `prompt.md` |
| `evals/<name>/<case>/graders/` | the graders of the case, a file for each |
| `evals/<name>/<case>/known/` | the responses known to pass and to fail, `pass.md` and `fail.md` |
| `evals/results/` | the results of a run of the eval cases, written by the evaluation tool and ignored by git |
| `scripts/` | the scripts of the checks |
| `scripts/ci/` | the command running every check, and the pinned versions of the tools from outside the repository it needs |
| `scripts/tools/` | the checks of the catalog, a file for each |
| `scripts/lib/` | the code the checks share |
| `test/` | the unit tests of the scripts |
| `test/integration/` | the tests of the scripts that start a process or write files |

## Checks

The command of `CONTRIBUTING.md` -> Checks runs every check below, and the pipeline runs that
command. A check runs alone by its own command, from the root of the repository.

| Check | Run alone |
|---|---|
| `tests` | `node --test` |
| `refinement-chain` | `node scripts/tools/refinement-chain.js` |
| `file-references` | `node scripts/tools/file-references.js` |
| `frontmatter` | `node scripts/tools/frontmatter.js` |
