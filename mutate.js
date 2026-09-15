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
const VERBOSE = process.argv.includes('--verbose');
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

// Anchors are written with \n. The files are not all LF: a `git checkout` under
// core.autocrlf rewrites index.html as CRLF, and after that every multi-line
// anchor silently matches nothing. That is precisely how this tool first told
// me the Mainframe bug had gone undetected — the mutation had never applied.
function fitEndings(text, src) {
  return src.includes('\r\n') ? text.replace(/\r?\n/g, '\r\n') : text;
}

function apply(mut) {
  const p = path.join(ROOT, mut.file);
  const src = fs.readFileSync(p, 'utf8');
  const find = fitEndings(mut.find, src);
  // An anchor matching zero times leaves the file untouched, so the build passes
  // and the mutation looks like a survivor — a red result that means nothing
  // happened. Matching more than once is just as bad: the edit lands somewhere
  // unintended. Both are errors, never warnings, and never survivors.
  const hits = src.split(find).length - 1;
  if (hits !== 1) {
    throw new Error(`anchor matched ${hits} times in ${mut.file} (needs exactly 1)`);
  }
  fs.writeFileSync(p, src.replace(find, fitEndings(mut.replace, src)));
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
      let caught = false, right = false, detail = '', error = null;
      try {
        apply(mut);
        // A real edit comes with a regenerated map, so refresh it — otherwise
        // checkCodeMap fires first and masks the gate actually under audit.
        // Not just for index.html: the map records every support file's line
        // count too, so a one-line manifest.json change stales it just as much.
        // That masking is exactly what this audit is for, and it caught it here
        // first — unshipped-asset reported "caught" while proving nothing.
        if (mut.refreshMap !== false) sh(process.execPath, ['codemap.js']);

        const r = sh(process.execPath, ['build.js']);
        caught = r.code !== 0;
        right = caught && r.out.includes(mut.expect);
        // Prefer the failing assertion's own name over the generic "the test
        // suite did not pass", so `expect` can name the test that should own
        // this defect rather than settling for "something went red".
        const failLine = (r.out.match(/^\s*FAIL\s+(.*)$/m) || [, ''])[1].trim();
        const buildLine = (r.out.match(/BUILD FAILED: (.*)/) || [, ''])[1].trim();
        detail = (failLine || buildLine).slice(0, 64);
      } catch (e) {
        // A mutation that could not be applied proves nothing in either
        // direction. Reporting it as a survivor claims the safety net has a
        // hole; reporting it as caught claims the opposite. It is its own
        // outcome, and it is a failure of the audit, not of the code.
        error = e.message;
      } finally {
        restore(snap);
      }
      results.push({ ...mut, caught, right, detail, error });
      if (VERBOSE && detail) console.log('    -> ' + detail);
      console.log(error ? 'ERROR (did not apply)'
                : caught ? (right ? 'caught' : 'caught (wrong gate)')
                : 'SURVIVED');
    }
  } finally {
    restore(snap);
  }

  const errored = results.filter(r => r.error);
  const survivors = results.filter(r => !r.caught && !r.error);
  const misfiled = results.filter(r => r.caught && !r.right);

  console.log('');
  console.log(`${results.filter(r => r.caught).length}/${results.length} mutations caught`);

  if (errored.length) {
    console.log('\nCould not be applied — these tested NOTHING:');
    errored.forEach(r => console.log(`  ${r.id}: ${r.error}`));
    process.exitCode = 1;
  }
  if (misfiled.length) {
    console.log('\nCaught, but not by the gate that should own them:');
    misfiled.forEach(r => console.log(`  ${r.id}\n    ${r.detail}`));
  }
  if (survivors.length) {
    console.log('\nSURVIVED — these defects can be introduced today and every check passes:');
    survivors.forEach(r => console.log(`  ${r.id}: ${r.note}`));
    process.exitCode = 1;
  } else if (!errored.length) {
    console.log('No survivors: every catalogued defect is detected.');
  }

  // The audit is worthless if it leaves the tree altered, so say so either way.
  const after = sh('git', ['status', '--porcelain']);
  console.log(after.out.trim()
    ? '\nWARNING: tree is dirty after the run:\n' + after.out
    : '\nWorking tree restored clean.');
}

main();
