# Contributing to SDLC

## Taking part

A person should report a problem or suggest an enhancement in an
[issue of the project](https://github.com/ssoft-ai/sdlc/issues). A pull request should implement an
enhancement only after the maintainers have agreed to it in the issue.

## Conduct

Every participant of the project shall follow the
[Contributor Covenant 2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct/) in
issues, pull requests and every other space of the project. A participant should report a
violation in a private message on Telegram to [@te_ssoft](https://t.me/te_ssoft). The maintainers
shall enforce the Covenant as its Enforcement Guidelines state.

## Issues

An issue describes a problem, an enhancement or a release. A reporter should open a separate issue
for each problem, enhancement or release, where no open issue carries it already. The title and
the body of an issue shall follow the issue form of its kind in `.github/ISSUE_TEMPLATE/` and its
example of the same name in `.github/examples/`, and its issue type should be the type that form
sets.

## Branches

| Branch | Holds | Reached by |
|---|---|---|
| `main` | released versions; the default branch, from which the catalog is installed | a pull request from `dev` at a release |
| `dev` | everything done and not yet released | a pull request from a working branch |
| working branch | the work of its issue | branched from `dev` |

No commit shall land on `main` or `dev` directly.

## Agents

The catalog serves any agent reading the open
[Agent Skills](https://agentskills.io/specification) format: Claude Code, Codex, Cursor and
others. Each part of the repository is read by every such agent or only by the agent it is made for:

| Part | Read by |
|---|---|
| `skills/` | every agent reading the Agent Skills format |
| `AGENTS.md` | every agent reading that file |
| `.claude-plugin/` | Claude Code |
| `evals/` | an evaluation tool, such as `claude plugin eval` of Claude Code |

| Subject | Force | Rule |
|---|---|---|
| A skill | shall | holds its rules whole in `skills/<name>/`, so that every agent applies it alike |
| An agent's own part | shall | holds nothing a skill needs: a manifest, a hook or a setting of an agent adds to the skills and changes none of their rules |
| A new agent | shall | a part that another agent alone reads stands in its own directory, named after that agent's convention, and enters the table above |

## Workflow

The steps below carry a change from its issue into `dev`. A release merges `dev` into `main` as the
Release section states; the changes it needs on `dev` take the steps below.

| Step | Force | Rule |
|---|---|---|
| Issue | shall | a change starts from an issue |
| Branch | shall | from `dev`, named as the Commits and branches section states |
| Changelog | shall | a key change has an entry in `CHANGELOG.md`, new or corrected, as the Changelog section states |
| `AGENTS.md` | shall | the map and the checks of `AGENTS.md` are updated by a change after which they no longer describe the repository |
| Pull request | shall | targets `dev`; its title and its description follow `.github/pull_request_template.md` and `.github/examples/pull-request.md` |
| Merge | shall | the request is merged into `dev` once its checks have passed, its review is given and its issue is met: every acceptance criterion of an enhancement, the expected behaviour of a problem under its steps |
| Close | shall | the issue is closed once its request merges into `dev`: GitHub closes an issue by itself only on a merge into the default branch, `main` |

### From a clone to a pull request

| Step | Force | Rule |
|---|---|---|
| Clone | shall | a member clones the project: `git clone https://github.com/ssoft-ai/sdlc.git`; a person who is not a member forks it on GitHub, clones the fork and adds the project as the remote `upstream`: `git remote add upstream https://github.com/ssoft-ai/sdlc.git` |
| Branch | shall | from the current branch `dev` of the project: `git fetch origin` and `git switch -c <branch> --no-track origin/dev` in a clone of the project, `git fetch upstream` and `git switch -c <branch> --no-track upstream/dev` in a clone of a fork |
| Check | shall | the checks of the Checks section pass |
| Commits | shall | as the Commits and branches section states |
| Push | shall | `git push -u origin HEAD` |
| Pull request | shall | into `dev` of [ssoft-ai/sdlc](https://github.com/ssoft-ai/sdlc), also from a fork |

### Pull requests from a fork

The author of a pull request from a fork should allow edits by maintainers, so a maintainer
can rebase the branch onto `dev`.

## Licence

By opening a pull request, a contributor affirms the right to contribute the content of the
request and contributes it under the terms of `LICENSE.md`.

## Standards

The catalog follows the life cycle processes of ISO/IEC/IEEE 12207, the life cycle stages of
ISO/IEC/IEEE 24748-1, and the complement ISO/IEC 5338, which modifies and adds to the processes of
ISO/IEC/IEEE 12207 and ISO/IEC/IEEE 15288 for a system with an AI element; its vocabulary is that
of ISO/IEC/IEEE 24765. The work also draws on other standards: those refining these processes for a
field, describing their application or setting how a process is described. A standard refining a
process, as the rules below call it, describes how a process is carried out in more detail than the
life cycle processes do. A standard is meant in its current edition wherever this file names it or
refers to it.

## Writing

| Subject | Force | Rule |
|---|---|---|
| Language | shall | English: skills, agents, commands, code, commits, issues, pull requests |
| Comments | shall | none in code, an issue form or a template: a name, a field or the example says what a comment would |
| Citing a standard | shall | a text names a standard only where the standard is part of what the text describes, and cites no clause and no edition, since its reader holds no standard to follow such a reference into |
| Terms | shall | a term of the standards the Standards section names; where they lack one, a term of another standard the work draws on; where no standard has one, the term of the documentation of the language or the tool; where none has one, the term agreed in the issue |
| Punctuation | shall | keyboard characters in text for human readers: `-` for a dash, `"` and `'` for quotes, `...` for an ellipsis |

## Checks

```sh
node scripts/ci/check.js
```

- A test holds the behaviour of code or a relation between artifacts; a test comparing a text
  with another text shall not be written.

## Writing a skill

### Level and name

| Level | Covers | Refines | Name | Example |
|---|---|---|---|---|
| Life cycle | the life cycle model, its stages and their decision gates | - | `software-life-cycle` | - |
| Process | a life cycle process of a standard the Standards section says the catalog follows | the life cycle | the name of the process in the life cycle processes the catalog follows, or in the complement for a process only the complement holds, without the word "process" | `verification`, `system-analysis` |
| Practice | a way of carrying out a process | a process | the name of the practice in a vocabulary the Standards section names, or where none has one, in a standard refining the process, or where neither has one, the name agreed in the issue of the skill | `testing` |
| Language or tool | what a language or a tool adds to a practice | a practice | the name of the language or the tool in `a-z` and `0-9`, then the name of the practice | `cpp-testing` for C++ |

| Subject | Force | Rule |
|---|---|---|
| Format | shall | a skill follows the [Agent Skills specification](https://agentskills.io/specification), each of its rules at the force the specification gives it |
| Place | shall | a skill lives in `skills/<name>/SKILL.md` |
| Name | shall | the letters and digits of the name are the ASCII `a-z` and `0-9` only, though the specification admits other lowercase letters |
| Description | shall | the `description` key of `SKILL.md` says what the skill does and when an agent applies it |
| File references | shall | `SKILL.md` refers to a file in `references/` or another directory of the skill by its path `<directory>/<file>`, a file directly inside a directory of the skill, alone in backticks |
| Parent | shall | `SKILL.md` of a skill of the Life cycle level, a root, carries no metadata key `sdlc-refines`; `SKILL.md` of a skill of any other level carries `sdlc-refines` holding the name of the skill it refines |
| Chain | shall | following `sdlc-refines` from any skill reaches a root |
| Level key | shall | `SKILL.md` carries the metadata key `sdlc-level` naming the level its chain of `sdlc-refines` places it at: `life-cycle` for a root, then `process`, `practice`, `language-or-tool` |

```
---
name: testing
description: ...
metadata:
  sdlc-refines: verification
  sdlc-level: practice
---
```

### What a skill holds

| Level | Force | Holds |
|---|---|---|
| Life cycle | shall | the stages of the life cycle, the processes each stage draws on, and the decision gates that open and close the work of each stage |
| Process | shall | at least the parts of the table below |
| Practice | shall | a reference by name to the outcomes of the process it refines that the practice achieves, and how it achieves them |
| Language or tool | shall | what the language or the tool changes in how the practice achieves its outcomes: a command, a construct, a limit |

| Part of a process skill | Holds |
|---|---|
| Purpose | the goal of performing the process, in a statement |
| Outcomes | the results that show the purpose achieved, together necessary and sufficient for it; each named and observable as an artifact produced other than an information item, a change of state or a constraint met |
| Activities and tasks | how the outcomes are reached, each task tied to the outcomes it contributes to |
| Inputs | the work products the process uses, each with the outcomes it serves and its source: the process or the party outside the life cycle it comes from |
| Outputs | the work products the process produces, each with the outcomes it serves and its receiver: the process or the party outside the life cycle it passes to |

| Subject | Force | Rule |
|---|---|---|
| Any project | shall | the text holds in any project of a user, since an agent reads it there: it names no file, branch or path of this repository outside the skill's own directory |
| Substance | shall | a skill names no standard and carries no remark on a rule's source or its verification |
| Force | shall | every rule states its force with a verbal form of ISO/IEC Directives, Part 2: shall or shall not for a requirement, should or should not for a recommendation, may or need not for a permission; can or cannot state a possibility and must an external constraint, and neither states the force of a rule; a section of a skill carries no force marker; the force follows what the agent has to do - shall where the work is wrong or harmful without the rule, should where the rule is right by default and the agent can justify an exception, may where it states an admissible option -, and is never weaker than a clear requirement the rule rests on |
| Practice content | shall | content of a standard refining a process that changes no task of it - that adds, removes or replaces no task and changes no outcome, input or output of one, such as how a task is performed - is left to a practice skill refining that process |
| A narrower skill | shall | it refers to the skill it refines by its name in backticks, takes that skill's purpose, outcomes, activities, tasks, inputs, outputs and names as given, contradicts none of them and refers to them by name rather than restating them |
| References | shall | a skill refers in backticks to no skill of the catalog outside its chain of `sdlc-refines`, so a root refers in backticks to no other skill |
| Standards | shall | a skill follows the standards the Standards section says the catalog follows - a complement only where the system worked on is of the kind the complement serves -, and contradicts no standard the work draws on |
| Beyond the standards | may | a skill holds what no standard states, such as a convention, a practice of the field or the command of a tool; a process skill holds nothing the rule Practice content leaves to a practice skill |
| A covered concern | should | a concern an existing skill covers becomes a rule of that skill, not a new skill |
| Hooks | shall | a skill names no hook, and no rule of a skill relies on a hook being present |

### Eval cases

Where a skill has eval cases, they meet the rules below; whether a task gives a skill cases,
and which rules they reach, its issue sets.

| Subject | Force | Rule |
|---|---|---|
| Place | shall | the cases of a skill stand in `evals/<name>/` |
| Verdict | shall | a case is judged by the result a response leaves, never by the way it reached that result |
| Known responses | shall | beside every case, a response known to pass and one known to fail |
| Indicator | may | a case may carry an indicator that the skill was loaded; the indicator reports and is no part of the verdict |
| Kept cases | shall | a case stays in the suite even where a response without the skill passes it |
| Results | shall | the results of a run are not committed |

A skill may be measured by running its own cases with the skill and without it, or, for a
change, before the change and after it. Each run shall load the ancestors of the measured skill
along `sdlc-refines` up to its root and, in every run but the one without the skill, the skill
itself, and no other skill, so that no other narrower skill shows in the score. A comparison
with the whole catalog and without it is no such measurement.

## Hooks

A hook shall check only a rule a skill states, and shall carry no rule of its own.

## Commits and branches

Commit messages shall follow
[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). What the
specification leaves to the project:

| Part | Force | Rule |
|---|---|---|
| `<type>` | shall | `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, or another lowercase word for a recurring kind of work none of these names |
| `(scope)` | should | the skill or the part of the catalog the change touches |
| `!` | shall | marks a change that removes or renames a skill, an agent, a command or a hook, or changes a rule of a skill so that a response its cases passed before now fails; the body says what changes for a user |
| First line | shall | at most 72 characters |
| Body | shall | wrapped at 72: why the change was made and what it solves |
| Issue | should | named by the branch and the pull request title, not by the commit |

```
feat(verification): add the verification process skill
```

A contributor shall name a branch `<user>/<type>/SDLC-<n>/<subject>`, where `<type>` is a type of
the table above and `<n>` the number of its issue. Every commit of the branch shall pass the checks
of the Checks section.

## Changelog

`CHANGELOG.md` shall follow Keep a Changelog; `[Unreleased]` collects the release in progress. The
rules below bind every entry a change adds or corrects.

| Rule | Force |
|---|---|
| An entry records a key change a user notices: a new skill, agent, command or hook, a change of behaviour, a break, a fix of a visible defect | should |
| A refactoring, a test, a tooling or a pipeline change takes no entry | should |
| Subsections do not repeat and stand in the order `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed` | shall |
| An entry is a sentence of at most 100 characters saying what changed, with no detail or retelling | shall |
| A change an entry of the release already covers extends that entry rather than taking a new one | shall |
| An entry of the release in progress that a change makes untrue is corrected in place | shall |
| No entry contradicts the catalog | shall |

```
- [verification] Added the process skill
- [testing] Added `cpp-testing`, the C++ refinement of `testing`
```

## Release

| Step | Force | Rule |
|---|---|---|
| `[Unreleased]` | shall | its entries meet the rules of the Changelog section, and its heading is renamed to the version and date |
| Version | shall | `version` of `.claude-plugin/plugin.json` carries the new version |
| Merge | shall | a pull request from `dev` into `main`, merged once its checks have passed, its review is given and every acceptance criterion of the release issue is met; the merge closes that issue, and the merge commit on `main` is tagged `v<version>` |
| Released heading | shall | a released heading of `CHANGELOG.md` stays as it is |
