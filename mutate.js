#!/usr/bin/env node
// Mutation audit: break the game on purpose, one defect at a time, and check
// that something notices.
//
//   node mutate.js            run every mutation
//   node mutate.js seal       only mutations whose id contains "seal"
//   node mutate.js --list     print the catalogue and exit
//
// WHY THIS EXISTS
//
// Every gate in this repo was written because some failure is invisible in a
// browser. But a gate that has never fired has not been shown to work — it has
// only been shown not to complain, which is the same thing a gate that is
// silently disabled does. The suite going green proves the code passes the
// tests; it does not prove the tests would fail if the code were wrong.
//
// So each entry below is a real defect, several of them bugs this project
// actually shipped. The audit applies one, runs the full build chain, and
// records whether anything went red. A mutation that SURVIVES is the finding:
// it means that defect could be introduced today and every check would pass.
//
// SAFETY
//
// Source files are edited in place and restored in a finally block. The run
// refuses to start on a dirty tree, so if it is ever killed mid-mutation the
// recovery is `git checkout -- .` with nothing of yours at stake.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = __dirname;
const LIST = process.argv.includes('--list');
const filter = process.argv.slice(2).find(a => !a.startsWith('--'));

// Files a mutation may touch. Snapshotted whole and restored verbatim.
const VOLATILE = ['index.html', 'sw.js', 'icon.svg', 'manifest.json', 'CODE-MAP.md'];

/* ------------------------------ the catalogue ----------------------------- */
//
// `expect` is a substring of the message the audit should see. It is not
// cosmetic: a mutation caught by the WRONG gate is only accidentally caught,
// and the next edit could move it out from under that gate without anyone
// noticing. Matching the message is what tells the two apart.

const MUTATIONS = [
  {
    id: 'stale-codemap',
    file: 'index.html',
    find: '<meta name="theme-color" content="#0a0e17">',
    replace: '<meta name="theme-color" content="#0a0e17">\n<!-- a line nobody indexed -->',
    refreshMap: false,              // the point of this one is the stale map
    expect: 'CODE-MAP.md is out of date',
    note: 'index.html edited without regenerating the map',
  },
  {
    id: 'sw-cache-name',
    file: 'sw.js',
    find: "const CACHE_NAME = 'wired-v2.0.0';",
    replace: "const CACHE_NAME = 'wired-v1';",
    expect: 'CACHE_NAME',
    note: 'returning players keep being served the old build from cache',
  },
  {
    id: 'external-script',
    file: 'index.html',
    find: '<link rel="manifest" href="manifest.json">',
    replace: '<link rel="manifest" href="manifest.json">\n<script src="https://cdn.example.com/x.js"></script>',
    expect: 'no longer self-contained',
    note: 'the zero-dependency rule broken by one tag',
  },
  {
    id: 'debug-scaffolding',
    file: 'index.html',
    find: '  // ---------- Boot ----------',
    replace: '  // TODO: take this out before shipping\n  // ---------- Boot ----------',
    expect: 'debug scaffolding',
    note: 'a parked note shipped in the game file',
  },
  {
    id: 'icon-art-drift',
    file: 'icon.svg',
    find: 'M56 12 L28 56',
    replace: 'M57 12 L28 56',
    expect: 'bolt path in make-icons.mjs',
    note: 'icon.svg redrawn, PNGs left rasterised from the old art',
  },
  {
    id: 'unshipped-asset',
    file: 'manifest.json',
    find: '    {\n      "src": "icons/icon-192.png",',
    replace: '    {\n      "src": "icons/icon-1024.png",\n      "sizes": "1024x1024",\n      "type": "image/png",\n      "purpose": "any"\n    },\n    {\n      "src": "icons/icon-192.png",',
    expect: 'not in RUNTIME_FILES',
    note: 'the manifest names a file the zip would not contain',
  },
  {
    id: 'handoff-is-free',
    file: 'index.html',
    find: '        setActiveColor(i);\n        return;\n      }\n    }\n    activeColor = null;',
    replace: '        activeColor = i;\n        return;\n      }\n    }\n    activeColor = null;',
    expect: 'FAILED',
    note: 'THE Mainframe bug: automatic handoff costs no tick, so ordinary play beats par',
  },
  {
    id: 'free-switch-charges',
    file: 'index.html',
    find: "      if(kind === 'F') activeColor = i;         // free: no tick is spent",
    replace: "      if(kind === 'F') { activeColor = i; stepTick(); }",
    expect: 'FAILED',
    note: 'the model charges for a switch the engine gives away — the same bug mirrored',
  },
  {
    id: 'patrol-negative-tick',
    file: 'index.html',
    find: 'const at = (i)=> ob.path[((i % n) + n) % n];',
    replace: 'const at = (i)=> ob.path[i % n];',
    expect: 'FAILED',
    note: 'first rendered frame of every patrol level throws again',
  },
  {
    id: 'par-contract-drift',
    file: 'index.html',
    find: '    "mainframe":     34,',
    replace: '    "mainframe":     33,',
    expect: 'FAILED',
    note: 'a committed par no longer matches what the solver derives',
  },
  {
    id: 'seal-never-fires',
    file: 'index.html',
    find: '    if(!open.length) return null;',
    replace: '    if(!open.length) return null;\n    return null;',
    expect: 'FAILED',
    note: 'the board-sealed warning goes permanently quiet',
  },
  {
    id: 'spark-is-harmless',
    file: 'index.html',
    find: '    return isGate(ob) ? gateIsLive(ob, tick) : true;',
    replace: '    return isGate(ob) ? gateIsLive(ob, tick) : false;',
    expect: 'FAILED',
    note: 'patrols stop shorting wires — the central hazard disabled',
  },
];

/* --------------------------------- runner --------------------------------- */

function sh(cmd, args) {
  try {
    return { code: 0, out: execFileSync(cmd, args, { cwd: ROOT, encoding: 'utf8', stdio: 'pipe' }) };
  } catch (e) {
    return { code: e.status ?? 1, out: (e.stdout || '') + (e.stderr || '') };
  }
}

function assertCleanTree() {
  const r = sh('git', ['status', '--porcelain']);
  if (r.code !== 0) throw new Error('not a git repo, or git is unavailable');
  if (r.out.trim()) {
    console.error('Refusing to run: the working tree has uncommitted changes.');
    console.error('This edits source files in place. Commit or stash first.\n');
    console.error(r.out.trim());
    process.exit(1);
  }
}

function snapshot() {
  const m = new Map();
  for (const f of VOLATILE) {
    const p = path.join(ROOT, f);
    if (fs.existsSync(p)) m.set(f, fs.readFileSync(p));
  }
  return m;
}

function restore(snap) {
  for (const [f, buf] of snap) fs.writeFileSync(path.join(ROOT, f), buf);
}

function apply(mut) {
  const p = path.join(ROOT, mut.file);
  const src = fs.readFileSync(p, 'utf8');
  // An anchor that matches zero times would leave the file untouched, the build
  // would pass, and the mutation would be recorded as "caught" — a clean green
  // that means nothing happened. Matching more than once is just as bad: the
  // edit lands somewhere unintended. Both are errors, never warnings.
  const hits = src.split(mut.find).length - 1;
  if (hits !== 1) {
    throw new Error(`anchor matched ${hits} times in ${mut.file} (needs exactly 1)`);
  }
  fs.writeFileSync(p, src.replace(mut.find, mut.replace));
}

function main() {
  const muts = filter ? MUTATIONS.filter(m => m.id.includes(filter)) : MUTATIONS;

  if (LIST) {
    muts.forEach(m => console.log(`${m.id.padEnd(22)} ${m.note}`));
    return;
  }
  if (!muts.length) {
    console.error(`No mutation id matches "${filter}".`);
    process.exit(1);
  }

  assertCleanTree();
  const snap = snapshot();
  const results = [];

  try {
    for (const mut of muts) {
      process.stdout.write(`${mut.id.padEnd(22)} `);
      let caught = false, right = false, detail = '';
      try {
        apply(mut);
        // A real edit to index.html comes with a regenerated map, so refresh it
        // — otherwise checkCodeMap fires first every time and masks the gate
        // actually under audit.
        if (mut.refreshMap !== false && mut.file === 'index.html') sh(process.execPath, ['codemap.js']);

        const r = sh(process.execPath, ['build.js']);
        caught = r.code !== 0;
        right = caught && r.out.includes(mut.expect);
        detail = (r.out.match(/BUILD FAILED: (.*)/) || [, ''])[1].trim().slice(0, 52);
        if (caught && !right) {
          const line = r.out.split('\n').find(l => /FAILED|FAIL/.test(l)) || '';
          detail = 'caught by something else: ' + line.trim().slice(0, 40);
        }
      } catch (e) {
        detail = 'MUTATION ERROR: ' + e.message;
      } finally {
        restore(snap);
      }
      results.push({ ...mut, caught, right, detail });
      console.log(caught ? (right ? 'caught' : 'caught (wrong gate)') : 'SURVIVED');
    }
  } finally {
    restore(snap);
  }

  const survivors = results.filter(r => !r.caught);
  const misfiled = results.filter(r => r.caught && !r.right);

  console.log('');
  console.log(`${results.length - survivors.length}/${results.length} mutations caught`);

  if (misfiled.length) {
    console.log('\nCaught, but not by the gate that should own them:');
    misfiled.forEach(r => console.log(`  ${r.id}\n    ${r.detail}`));
  }
  if (survivors.length) {
    console.log('\nSURVIVED — these defects can be introduced today and every check passes:');
    survivors.forEach(r => console.log(`  ${r.id}: ${r.note}`));
    process.exitCode = 1;
  } else {
    console.log('No survivors: every catalogued defect is detected.');
  }

  // The audit is worthless if it leaves the tree altered, so say so either way.
  const after = sh('git', ['status', '--porcelain']);
  console.log(after.out.trim()
    ? '\nWARNING: tree is dirty after the run:\n' + after.out
    : '\nWorking tree restored clean.');
}

main();
