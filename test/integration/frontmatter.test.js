'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { check } = require('../../scripts/tools/frontmatter');

function withSkills(names, run) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'frontmatter-'));
  try {
    for (const name of names) fs.mkdirSync(path.join(root, 'skills', name), { recursive: true });
    fs.writeFileSync(path.join(root, 'skills', 'README.md'), 'Not a skill.\n');
    return run(root);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

test('reports nothing where the validator accepts every skill', () => {
  withSkills(['acquisition', 'supply'], (root) => {
    assert.deepStrictEqual(check(root, () => ({ status: 0, output: 'Valid skill' })), []);
  });
});

test('reports each skill directory the validator rejects, and no other file', () => {
  withSkills(['supply', 'acquisition'], (root) => {
    const reports = check(root, () => ({ status: 1, output: 'Validation failed' }));
    assert.deepStrictEqual(reports, ['acquisition: Validation failed', 'supply: Validation failed']);
  });
});

for (const [label, ending] of [
  ['with a status other than 1', { status: 2, output: 'Usage' }],
  ['killed by a signal', { status: null, output: '' }],
]) {
  test(`reports a skill whose validation ends ${label}`, () => {
    withSkills(['acquisition'], (root) => {
      assert.strictEqual(check(root, () => ending).length, 1);
    });
  });
}

test('reports a skill the validator rejects, with what the validator says', () => {
  withSkills(['acquisition', 'supply'], (root) => {
    const validate = (dir) =>
      path.basename(dir) === 'supply' ? { status: 1, output: 'Validation failed:\n  - name must be lowercase\n' } : { status: 0, output: '' };
    assert.deepStrictEqual(check(root, validate), ['supply: Validation failed: - name must be lowercase']);
  });
});

test('reports once a validator that cannot run, with how to install it', () => {
  withSkills(['acquisition', 'supply'], (root) => {
    const reports = check(root, () => ({ error: 'ENOENT' }));
    assert.strictEqual(reports.length, 1);
    assert.match(reports[0], /^frontmatter: cannot run skills-ref \(ENOENT\); install .*pip install --no-deps --build-constraint \S+build-constraints\.txt -r \S+requirements\.txt$/);
  });
});
