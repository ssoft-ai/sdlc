'use strict';
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..');
const TOOLS = ['refinement-chain', 'file-references', 'frontmatter'];

const loadTool = (name) => require(path.join(ROOT, 'scripts', 'tools', `${name}.js`));
const reasonOf = (err) => String(err?.message ?? err).split('\n')[0];

function missingTools(programs) {
  return programs.filter((program) => spawnSync(program, ['--help'], { stdio: 'ignore' }).error);
}

function spawnIn(root, log = console.error) {
  return (command, args) => {
    const result = spawnSync(command, args, { cwd: root, stdio: 'inherit' });
    if (result.error) log(`check: cannot run ${command}: ${result.error.code}`);
    return result.status === 0;
  };
}

// Routes to every tool under scripts/tools; a tool that fails to load or throws costs only itself.
function main({
  root = ROOT,
  tools = TOOLS,
  load = loadTool,
  log = console.error,
  runTests = () => spawnIn(root, log)(process.execPath, ['--test']),
} = {}) {
  let passed = true;
  const loaded = [];
  for (const name of tools) {
    try {
      loaded.push([name, load(name)]);
    } catch (err) {
      log(`check: ${name} did not run - ${reasonOf(err)}`);
      passed = false;
    }
  }
  const missing = missingTools([...new Set(loaded.flatMap(([, tool]) => tool.needs ?? []))]);
  if (missing.length > 0) {
    const requirements = path.relative(process.cwd(), path.join(ROOT, 'scripts', 'ci', 'requirements.txt'));
    log(`check: missing ${missing.join(', ')}; install the pinned tools in a virtual environment with: pip install -r ${requirements}`);
    return 1;
  }
  passed = runTests() && passed;
  for (const [name, tool] of loaded) {
    try {
      const reports = tool.check(root);
      for (const report of reports) log(report);
      if (reports.length > 0) passed = false;
    } catch (err) {
      log(`check: ${name} did not run - ${reasonOf(err)}`);
      passed = false;
    }
  }
  return passed ? 0 : 1;
}

if (require.main === module) process.exitCode = main();

module.exports = { missingTools, spawnIn, main };
