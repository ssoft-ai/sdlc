| Part | Holds |
|---|---|
| Title | `SDLC-<n>: <what changed>`, with the number of the issue |
| `Closes #<n>` | the issue |
| Changes | what changed and where, briefly |
| Verification | how the change was checked against the issue, so a reviewer can repeat it; no check the pipeline reports |
| Out of scope | where any: what the issue leaves to other issues |

The reason and the scope stand in the issue and are not repeated.

---

Title: SDLC-<n>: Make the agent wait for a choice after comparing options

Closes #<n>

## Changes

- `skills/software-life-cycle/SKILL.md`, Decision gates: a comparison of options ends with the options presented and the question which to take; no file changes before the answer.
- `CHANGELOG.md`: the entry under Fixed.

## Verification

- Steps of the issue, run repeatedly with the catalog installed from this branch: every response ends with the question, and `git status` shows no change.
- The same runs with the catalog installed from `dev` reproduce the actual behaviour of the issue.
