'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { missingTools, spawnIn, main } = require('../scripts/ci/check');

test('finds no tool missing where each one runs', () => {
  assert.deepStrictEqual(missingTools([process.execPath]), []);
});

test('names a tool that is not on the path', () => {
  assert.deepStrictEqual(missingTools([process.execPath, 'no-such-tool-of-the-checks']), ['no-such-tool-of-the-checks']);
});

test('runs a command in the root of the repository', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'check-cwd-'));
  try {
    const script = 'process.exitCode = require("fs").realpathSync(process.cwd()) === require("fs").realpathSync(process.argv[1]) ? 0 : 1';
    assert.strictEqual(spawnIn(root, () => {})(process.execPath, ['-e', script, root]), true);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('names a command that cannot run', () => {
  const log = [];
  assert.strictEqual(spawnIn(os.tmpdir(), (line) => log.push(line))('no-such-tool-of-the-checks', []), false);
  assert.match(log.join('\n'), /cannot run no-such-tool-of-the-checks/);
});

test('exits the process with 1, naming the program, where a tool needs one that is missing', () => {
  const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'check-path-'));
  try {
    const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => key.toUpperCase() !== 'PATH'));
    env.PATH = empty;
    const result = spawnSync(process.execPath, [path.join(__dirname, '..', 'scripts', 'ci', 'check.js')], { env, encoding: 'utf8' });
    assert.strictEqual(result.status, 1);
    assert.match(result.stderr, /missing skills-ref/);
  } finally {
    fs.rmSync(empty, { recursive: true, force: true });
  }
});

// Fake tools stand in for the checks: each states what it needs and what it reports, or throws.
function checkWith(tools, { testsPass = true } = {}) {
  const log = [];
  const load = (name) => {
    const tool = tools[name];
    if (!tool) throw new Error(`no tool ${name}`);
    return {
      needs: tool.needs ?? [],
      check: () => {
        if (tool.throws) throw new Error(tool.throws);
        return tool.reports ?? [];
      },
    };
  };
  const status = main({ root: os.tmpdir(), tools: ['a', 'b'], load, runTests: () => testsPass, log: (line) => log.push(line) });
  return { status, report: log.join('\n') };
}

test('exits 0 and reports nothing where every check passes', () => {
  assert.deepStrictEqual(checkWith({ a: {}, b: {} }), { status: 0, report: '' });
});

test('reports the breaches every tool finds and exits 1', () => {
  const { status, report } = checkWith({ a: { reports: ['acquisition: one'] }, b: { reports: ['supply: two'] } });
  assert.strictEqual(status, 1);
  assert.match(report, /acquisition: one/);
  assert.match(report, /supply: two/);
});

test('exits 1 where the tests fail and every tool passes', () => {
  assert.strictEqual(checkWith({ a: {}, b: {} }, { testsPass: false }).status, 1);
});

test('reports the breaches of the tools where the tests fail, and exits 1', () => {
  const { status, report } = checkWith({ a: {}, b: { reports: ['supply: two'] } }, { testsPass: false });
  assert.strictEqual(status, 1);
  assert.match(report, /supply: two/);
});

test('names a program a tool needs that is missing, reports no breach, and exits 1', () => {
  const { status, report } = checkWith({ a: { reports: ['acquisition: one'] }, b: { needs: ['no-such-tool-of-the-checks'] } });
  assert.strictEqual(status, 1);
  assert.match(report, /missing no-such-tool-of-the-checks/);
  assert.doesNotMatch(report, /acquisition: one/);
});

for (const [label, a] of [
  ['that throws', { a: { throws: 'broken' } }],
  ['that cannot be loaded', {}],
]) {
  test(`names a tool ${label}, still reports the breaches of the others, and exits 1`, () => {
    const { status, report } = checkWith({ ...a, b: { reports: ['supply: two'] } });
    assert.strictEqual(status, 1);
    assert.match(report, /a did not run/);
    assert.match(report, /supply: two/);
  });
}
