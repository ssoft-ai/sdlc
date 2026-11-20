'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const { main } = require('../scripts/ci/check');

const PASSES = { status: 0 };
const FAILS = { status: 1 };
const CANNOT_START = { status: null, error: { code: 'ENOENT' } };
const KILLED = { status: null, signal: 'SIGTERM' };

function checkWith(outcomes) {
  const log = [];
  const checks = Object.keys(outcomes).map((name) => [name, [name]]);
  const status = main({ checks, run: ([name]) => outcomes[name], log: (line) => log.push(line) });
  return { status, report: log.join('\n') };
}

test('exits 0 and reports nothing where every check passes', () => {
  assert.deepStrictEqual(checkWith({ tests: PASSES, a: PASSES, b: PASSES }), { status: 0, report: '' });
});

for (const [place, outcomes] of [
  ['first', { tests: FAILS, a: PASSES, b: PASSES }],
  ['last', { tests: PASSES, a: PASSES, b: FAILS }],
]) {
  test(`names a failing check and exits 1 where it runs ${place}`, () => {
    const failing = Object.keys(outcomes).find((name) => outcomes[name] === FAILS);
    const { status, report } = checkWith(outcomes);
    assert.strictEqual(status, 1);
    assert.strictEqual(report, `check: ${failing} failed`);
  });
}

test('names every failing check, the later ones after an earlier one failed', () => {
  const { status, report } = checkWith({ tests: FAILS, a: PASSES, b: FAILS });
  assert.strictEqual(status, 1);
  assert.strictEqual(report, 'check: tests failed\ncheck: b failed');
});

test('names a check that cannot start, with the reason, and still names a later failing check', () => {
  const { status, report } = checkWith({ tests: PASSES, a: CANNOT_START, b: FAILS });
  assert.strictEqual(status, 1);
  assert.strictEqual(report, 'check: a did not run - ENOENT\ncheck: b failed');
});

test('names a check killed before it ended, and exits 1', () => {
  assert.deepStrictEqual(checkWith({ tests: PASSES, a: KILLED, b: PASSES }), { status: 1, report: 'check: a failed' });
});
