'use strict';
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const REPO = path.join(__dirname, '..', '..');
const CHECK = path.join('scripts', 'ci', 'check.js');
const DESCRIPTION = 'description: A skill of the catalog the checks are run over.';
// Without the validator, the frontmatter check names it.
const NEEDS_VALIDATOR = { skip: spawnSync('skills-ref', ['--help'], { stdio: 'ignore' }).error ? 'skills-ref is not on PATH' : false };

function makeCatalog(skills, testBody) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'check-catalog-'));
  const root = path.join(base, 'repo');
  fs.cpSync(path.join(REPO, 'scripts'), path.join(root, 'scripts'), { recursive: true });
  for (const [dir, frontmatter, body] of skills) {
    fs.mkdirSync(path.join(root, 'skills', dir), { recursive: true });
    fs.writeFileSync(path.join(root, 'skills', dir, 'SKILL.md'), `---\n${frontmatter.join('\n')}\n---\n\n${body}\n`);
  }
  fs.mkdirSync(path.join(root, 'test'));
  fs.writeFileSync(path.join(root, 'test', 'catalog.test.js'), `require('node:test')${testBody};\n`);
  for (const dir of ['elsewhere', 'empty']) fs.mkdirSync(path.join(base, dir));
  return { base, root, elsewhere: path.join(base, 'elsewhere'), empty: path.join(base, 'empty') };
}

// A nested `node --test` runs only without the variable its parent run sets.
function run(catalog, script, { path: searchPath, cwd = catalog.root } = {}) {
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => key !== 'NODE_TEST_CONTEXT'));
  if (searchPath !== undefined) {
    for (const key of Object.keys(env)) if (key.toUpperCase() === 'PATH') delete env[key];
    env.PATH = searchPath;
  }
  return spawnSync(process.execPath, [path.join(catalog.root, script)], { cwd, env, encoding: 'utf8' });
}

describe('over a catalog breaking each check once, with a failing test', () => {
  const BREACHES = {
    'refinement-chain': /orphan: sdlc-refines names "nowhere"/,
    'file-references': /top: refers to references\/missing\.md, which does not exist/,
    frontmatter: /^misnamed: \S/m,
  };
  const FAILING_TEST = /a test of the catalog that fails/;
  const FAILED = ['tests', ...Object.keys(BREACHES)].map((name) => new RegExp(`check: ${name} failed`));
  let catalog;

  before(() => {
    catalog = makeCatalog(
      [
        ['top', ['name: top', DESCRIPTION, 'metadata:', '  sdlc-level: life-cycle'], 'Keeps `references/missing.md`.'],
        ['misnamed', ['name: other-name', DESCRIPTION, 'metadata:', '  sdlc-refines: top', '  sdlc-level: process'], 'Refines `top`.'],
        ['orphan', ['name: orphan', DESCRIPTION, 'metadata:', '  sdlc-refines: nowhere', '  sdlc-level: process'], 'Refines a skill that is not there.'],
      ],
      "('a test of the catalog that fails', () => { throw new Error('fails'); })",
    );
  });

  after(() => fs.rmSync(catalog.base, { recursive: true, force: true }));

  for (const [label, cwd] of [
    ['from the root of the repository', () => undefined],
    ['from another directory', () => catalog.elsewhere],
  ]) {
    test(`reports the breach of every check and the failing test, names each failed check, and exits 1, run ${label}`, NEEDS_VALIDATOR, () => {
      const result = run(catalog, CHECK, { cwd: cwd() });
      assert.strictEqual(result.status, 1);
      for (const breach of Object.values(BREACHES)) assert.match(result.stderr, breach);
      for (const failed of FAILED) assert.match(result.stderr, failed);
      assert.match(result.stdout + result.stderr, FAILING_TEST);
    });
  }

  test('names a missing program and how to install it, runs everything else, and exits 1, run from another directory', () => {
    const result = run(catalog, CHECK, { path: catalog.empty, cwd: catalog.elsewhere });
    assert.strictEqual(result.status, 1);
    assert.match(result.stderr, /frontmatter: cannot run skills-ref \(ENOENT\); install .*scripts\/ci\/requirements\.txt/);
    assert.match(result.stderr, BREACHES['refinement-chain']);
    assert.match(result.stderr, BREACHES['file-references']);
    for (const failed of FAILED) assert.match(result.stderr, failed);
    assert.match(result.stdout + result.stderr, FAILING_TEST);
  });

  function withTool(file, source, act) {
    const tool = path.join(catalog.root, 'scripts', 'tools', file);
    const original = fs.existsSync(tool) ? fs.readFileSync(tool) : null;
    try {
      fs.writeFileSync(tool, source);
      return act();
    } finally {
      if (original === null) fs.rmSync(tool);
      else fs.writeFileSync(tool, original);
    }
  }

  test('runs a tool added under scripts/tools, naming it where it fails', () => {
    const result = withTool('added.js', "console.error('added: a breach');\nprocess.exitCode = 1;\n", () => run(catalog, CHECK));
    assert.strictEqual(result.status, 1);
    assert.match(result.stderr, /added: a breach/);
    assert.match(result.stderr, /check: added failed/);
  });

  test('names a tool that breaks as it loads, still reports the breaches of the others, and exits 1', NEEDS_VALIDATOR, () => {
    const result = withTool('file-references.js', "throw new Error('broken');\n", () => run(catalog, CHECK));
    assert.strictEqual(result.status, 1);
    assert.match(result.stderr, /check: file-references failed/);
    assert.match(result.stderr, BREACHES['refinement-chain']);
    assert.match(result.stderr, BREACHES.frontmatter);
  });

  for (const [tool, breach] of Object.entries(BREACHES)) {
    test(`runs ${tool} alone from another directory, reporting its breach, and exits 1`, tool === 'frontmatter' ? NEEDS_VALIDATOR : {}, () => {
      const result = run(catalog, path.join('scripts', 'tools', `${tool}.js`), { cwd: catalog.elsewhere });
      assert.strictEqual(result.status, 1);
      assert.match(result.stderr, breach);
    });
  }
});

describe('over a catalog breaking no check, with a passing test', () => {
  const TOOLS = ['refinement-chain', 'file-references', 'frontmatter'];
  let catalog;

  before(() => {
    catalog = makeCatalog(
      [
        ['top', ['name: top', DESCRIPTION, 'metadata:', '  sdlc-level: life-cycle'], 'The root of the catalog.'],
        ['child', ['name: child', DESCRIPTION, 'metadata:', '  sdlc-refines: top', '  sdlc-level: process'], 'Refines `top`.'],
      ],
      "('a test of the catalog that passes', () => {})",
    );
  });

  after(() => fs.rmSync(catalog.base, { recursive: true, force: true }));

  test('reports no failed check and exits 0', NEEDS_VALIDATOR, () => {
    const result = run(catalog, CHECK);
    assert.strictEqual(result.status, 0, result.stderr);
    assert.doesNotMatch(result.stderr, /check: /);
  });

  for (const tool of TOOLS) {
    test(`runs ${tool} alone from another directory, reporting nothing, and exits 0`, tool === 'frontmatter' ? NEEDS_VALIDATOR : {}, () => {
      const result = run(catalog, path.join('scripts', 'tools', `${tool}.js`), { cwd: catalog.elsewhere });
      assert.strictEqual(result.status, 0, result.stderr);
      assert.strictEqual(result.stderr, '');
    });
  }
});
