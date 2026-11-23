'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { check } = require('../../scripts/tools/refinement-chain');

function checkCatalog(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'refinement-chain-'));
  try {
    for (const [file, text] of Object.entries(files)) {
      fs.mkdirSync(path.dirname(path.join(root, 'skills', file)), { recursive: true });
      fs.writeFileSync(path.join(root, 'skills', file), text);
    }
    return check(root);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

function skill(name, { refines, level, body = '' } = {}) {
  const metadata = [refines && `  sdlc-refines: ${refines}`, level && `  sdlc-level: ${level}`].filter(Boolean);
  const frontmatter = [`name: ${name}`, 'description: A skill.', ...(metadata.length > 0 ? ['metadata:', ...metadata] : [])];
  return { [`${name}/SKILL.md`]: `---\n${frontmatter.join('\n')}\n---\n\n${body}\n` };
}

const root = skill('software-life-cycle', { level: 'life-cycle' });

test('reports nothing where every chain reaches the root at the levels it places', () => {
  assert.deepStrictEqual(
    checkCatalog({
      ...root,
      ...skill('verification', { refines: 'software-life-cycle', level: 'process', body: 'Refines `software-life-cycle`.' }),
      ...skill('testing', { refines: 'verification', level: 'practice', body: 'Refines `verification` of `software-life-cycle`.' }),
    }),
    [],
  );
});

test('reports a skill refining a skill the catalog does not hold', () => {
  assert.deepStrictEqual(checkCatalog({ ...root, ...skill('verification', { refines: 'verificaton' }) }), [
    'verification: sdlc-refines names "verificaton", which is no skill of the catalog',
  ]);
});

test('reports a chain of refinement that returns to a skill it has passed', () => {
  assert.deepStrictEqual(
    checkCatalog({ ...skill('review', { refines: 'testing', body: 'Refines `testing`.' }), ...skill('testing', { refines: 'review', body: 'Refines `review`.' }) }),
    [
      'review: the chain of sdlc-refines review -> testing -> review reaches no root',
      'testing: the chain of sdlc-refines testing -> review -> testing reaches no root',
    ],
  );
});

test('reports a reference in backticks to a skill outside the chain of refinement', () => {
  assert.deepStrictEqual(
    checkCatalog({
      ...root,
      ...skill('verification', { refines: 'software-life-cycle', level: 'process', body: 'Refines `software-life-cycle`.' }),
      ...skill('implementation', { refines: 'software-life-cycle', level: 'process', body: 'Refines `software-life-cycle`.' }),
      ...skill('testing', {
        refines: 'verification',
        level: 'practice',
        body: '`testing` refines `verification` of `software-life-cycle`; units come from `implementation`.',
      }),
    }),
    ['testing: refers to `implementation`, a skill outside its chain of sdlc-refines'],
  );
});

test('reports a skill whose text does not refer to the skill it refines', () => {
  assert.deepStrictEqual(checkCatalog({ ...root, ...skill('verification', { refines: 'software-life-cycle', level: 'process', body: 'No name.' }) }), [
    'verification: does not refer to `software-life-cycle`, the skill it refines',
  ]);
});

test('reports a skill that carries no sdlc-level', () => {
  assert.deepStrictEqual(checkCatalog({ ...root, ...skill('verification', { refines: 'software-life-cycle', body: 'Refines `software-life-cycle`.' }) }), [
    'verification: carries no metadata key sdlc-level',
  ]);
});

test('reports an sdlc-level its chain of refinement contradicts', () => {
  assert.deepStrictEqual(
    checkCatalog({
      ...root,
      ...skill('verification', { refines: 'software-life-cycle', level: 'process', body: 'Refines `software-life-cycle`.' }),
      ...skill('testing', { refines: 'verification', level: 'process', body: 'Refines `verification`.' }),
    }),
    ['testing: sdlc-level is "process", but its chain of sdlc-refines places it at "practice"'],
  );
});

test('reads sdlc-refines and sdlc-level from the frontmatter alone, with either line ending, and no directory without SKILL.md', () => {
  assert.deepStrictEqual(
    checkCatalog({
      'software-life-cycle/SKILL.md':
        '---\nname: software-life-cycle\nmetadata:\n  sdlc-level: life-cycle\n---\n\nA child writes:\n\n    metadata:\n      sdlc-refines: verification\n      sdlc-level: process\n',
      'verification/SKILL.md':
        '---\r\nname: verification\r\nmetadata:\r\n  sdlc-refines: software-life-cycle\r\n  sdlc-level: process\r\n---\r\n\r\nRefines `software-life-cycle`.\r\n',
      'assets/notes.txt': 'Not a skill.\n',
    }),
    [],
  );
});
