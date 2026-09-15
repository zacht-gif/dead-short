#!/usr/bin/env node
// Generates CODE-MAP.md — the "where is it" index for this repo.
//
//   node codemap.js           regenerate CODE-MAP.md
//   node codemap.js --check   exit non-zero if the committed map is stale
//
// Why generated rather than written: index.html is one 200 KB file, so any
// useful index is a list of line numbers, and a hand-maintained list of line
// numbers is wrong the moment anyone inserts a line above it. A map that is
// confidently wrong costs more than no map — you follow it to the wrong place
// and only notice after the edit. So the map is derived, and --check (wired
// into build.js) makes a stale one fail the build instead of misleading you.
//
// This file knows only about LOCATIONS. The things a parser cannot see — data
// shapes, invariants, which three places an edit has to touch — live in
// ARCHITECTURE.md, which is hand-written on purpose and does not rot, because
// it names shapes rather than lines.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'CODE-MAP.md');
const CHECK = process.argv.includes('--check');

const SUPPORT = [
  ['index.html',    'The entire game: markup, styles and engine in one file.'],
  ['build.js',      'Release gate + packager. Refuses to zip a build that fails a check.'],
  ['codemap.js',    'Generates CODE-MAP.md. This file.'],
  ['make-icons.mjs', 'Rasterizes icons/*.png from the same art as icon.svg.'],
  ['shots.mjs',     'Captures store/screenshots/ from the real game.'],
  ['chrome.mjs',    'Headless-Chrome plumbing for shots.mjs.'],
  ['harness.js',    'Loads the inline game script into a stub DOM under node:vm.'],
  ['test.js',       'Headless runner for the in-page selfTest().'],
  ['solve.js',      'Proves each level routes, computes par, replays it to verify.'],
  ['sw.js',         'Service worker. CACHE_NAME must contain GAME_VERSION.'],
  ['manifest.json', 'PWA manifest.'],
  ['icon.svg',      'The only image asset the game ships.'],
];

/* ------------------------------- extraction ------------------------------- */

function linesOf(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8').replace(/\r\n/g, '\n').split('\n');
}

// Three marker styles, one per region of the file.
function findSections(ls) {
  const out = [];
  for (let i = 0; i < ls.length; i++) {
    const l = ls[i];
    let m;
    if ((m = l.match(/^\s*\/\*\s*-{8,}\s*(.+?)\s*-{8,}\s*\*\/\s*$/))) {
      out.push({ line: i + 1, region: 'CSS', name: m[1] });
    } else if ((m = l.match(/^\s*<!--\s*={4,}\s*(.+?)\s*={4,}\s*-->\s*$/))) {
      out.push({ line: i + 1, region: 'HTML', name: m[1] });
    } else if ((m = l.match(/^\s*\/\/\s*-{8,}\s*(.+?)\s*-{8,}\s*$/))) {
      out.push({ line: i + 1, region: 'JS', name: m[1] });
    } else if (/^\s*\/\/\s*={6,}\s*$/.test(l)) {
      // Major three-line JS banner:  // ====  /  // NAME  /  // ====
      const nm = (ls[i + 1] || '').match(/^\s*\/\/\s*([A-Z][A-Z0-9 -]+?)\s*$/);
      if (nm && /^\s*\/\/\s*={6,}\s*$/.test(ls[i + 2] || '')) {
        out.push({ line: i + 1, region: 'JS', name: nm[1], major: true });
        i += 2;
      }
    }
  }
  return out;
}

// A header whose text ran long and lost its closing dashes still marks a
// section — "// ---------- Cosmetic perks (purely visual —" is a real one.
//
// The dash count is the discriminator, and it is exact across this file:
// every one of the 27 real section headers opens with TEN dashes, the prose
// dividers inside LEVELS use four, and the test-group labels inside selfTest()
// use three. Matching on four caught two paragraphs of prose and printed the
// first line of one as a section title.
function findLooseSections(ls) {
  const out = [];
  ls.forEach((l, i) => {
    const m = l.match(/^\s*\/\/\s*-{8,}\s*(.+?)\s*$/);
    if (!m || /-{8,}\s*$/.test(l)) return;
    // The header text wrapped onto the next source line. Mark the cut rather
    // than printing a title that trails off in a comma.
    out.push({ line: i + 1, region: 'JS', name: m[1].replace(/[,\-—]\s*$/, '') + '...' });
  });
  return out;
}

// The suite groups its assertions under "// --- Name -----" labels. Indexing
// them separately answers "where is the test for X" without reading selfTest().
function findTestGroups(ls) {
  const out = [];
  ls.forEach((l, i) => {
    const m = l.match(/^\s*\/\/\s*-{3}\s+(.+?)\s+-{3,}\s*$/);
    if (m) out.push({ line: i + 1, name: m[1] });
  });
  return out;
}

function findFunctions(ls) {
  const out = [];
  ls.forEach((l, i) => {
    const m = l.match(/^\s*function\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\)/);
    if (m) out.push({ line: i + 1, name: m[1], args: m[2].trim() });
  });
  return out;
}

function findConsts(ls) {
  const out = [];
  ls.forEach((l, i) => {
    const m = l.match(/^  (const|let)\s+([A-Za-z_$][\w$]*)\s*=\s*(.*)$/);
    if (!m) return;
    // Cached DOM handles are noise in an index — dozens of getElementById lines.
    if (/document\.getElementById/.test(m[3])) return;
    let val = m[3].replace(/\s*\/\/.*$/, '').trim();
    if (val.length > 46) val = val.slice(0, 46).trimEnd() + '...';
    out.push({ line: i + 1, kind: m[1], name: m[2], val });
  });
  return out;
}

function findDomIds(ls) {
  const seen = new Map();
  ls.forEach((l, i) => {
    const re = /\bid="([A-Za-z0-9_-]+)"/g;
    let m;
    while ((m = re.exec(l))) if (!seen.has(m[1])) seen.set(m[1], i + 1);
  });
  return [...seen].map(([id, line]) => ({ id, line })).sort((a, b) => a.id.localeCompare(b.id));
}

function findLevels(src) {
  const pars = {};
  const pc = src.match(/const\s+PAR_CONTRACT\s*=\s*\{([\s\S]*?)\};/);
  if (pc) for (const m of pc[1].matchAll(/"([\w-]+)"\s*:\s*(\d+)/g)) pars[m[1]] = Number(m[2]);

  const out = [];
  const re = /slug:\s*"([\w-]+)",\s*name:\s*"([^"]+)",\s*cols:\s*(\d+),\s*rows:\s*(\d+)/g;
  let m;
  while ((m = re.exec(src))) {
    out.push({
      line: src.slice(0, m.index).split('\n').length,
      slug: m[1],
      name: m[2],
      cols: Number(m[3]),
      rows: Number(m[4]),
      par: pars[m[1]],
    });
  }
  return out;
}

function findStorageKeys(src) {
  const hits = [...src.matchAll(/STORE_PREFIX\s*\+\s*'([^']+)'/g)].map((m) => m[1]);
  return [...new Set(hits)].sort();
}

function findDevExports(src) {
  const m = src.match(/window\.__wiredDev\s*=\s*\{([\s\S]*?)\};/);
  if (!m) return [];
  return m[1].replace(/\s+/g, ' ').split(',').map((s) => s.trim()).filter(Boolean);
}

/* -------------------------------- rendering ------------------------------- */

const pad = (s, n) => String(s).padEnd(n);

function render() {
  const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').replace(/\r\n/g, '\n');
  const ls = src.split('\n');
  const sections = [...findSections(ls), ...findLooseSections(ls)].sort((a, b) => a.line - b.line);
  const fns = findFunctions(ls);
  const consts = findConsts(ls);
  const ids = findDomIds(ls);
  const levels = findLevels(src);
  const keys = findStorageKeys(src);
  const dev = findDevExports(src);
  const groups = findTestGroups(ls);
  const hash = crypto.createHash('sha256').update(src).digest('hex').slice(0, 12);

  const sectionEnd = (i) => (i + 1 < sections.length ? sections[i + 1].line - 1 : ls.length);
  const fnsIn = (a, b) => fns.filter((f) => f.line >= a && f.line <= b);

  const o = [];
  const w = (s) => o.push(s === undefined ? '' : s);

  w('# Wired - code map');
  w();
  w('**Generated file. Do not edit by hand - your changes will be overwritten.**');
  w('Regenerate with `node codemap.js`. `node codemap.js --check` proves it is current,');
  w('and `build.js` runs that check, so a stale map cannot ship.');
  w();
  w('This file answers *where*. For *what shape* and *what to touch for a given change*,');
  w('read [ARCHITECTURE.md](ARCHITECTURE.md) - hand-written, and stable because it names');
  w('shapes rather than line numbers.');
  w();
  w('**Use it like this** - find the thing, then read only its slice:');
  w();
  w('```bash');
  w('grep -n stepTick CODE-MAP.md       # -> 2035');
  w("sed -n '2035,2080p' index.html     # read those lines, not all " +
    ls.length.toLocaleString());
  w('```');
  w();
  w('Generated from `index.html` - ' + ls.length.toLocaleString() + ' lines, ' +
    Buffer.byteLength(src).toLocaleString() + ' bytes, sha256 `' + hash + '`.');
  w();

  w('## Files');
  w();
  w('| file | lines | what it is |');
  w('|---|---:|---|');
  for (const [f, desc] of SUPPORT) {
    if (!fs.existsSync(path.join(ROOT, f))) continue;
    w('| `' + f + '` | ' + linesOf(f).length.toLocaleString() + ' | ' + desc + ' |');
  }
  w();

  w('## index.html - section map');
  w();
  w('Every section marker in the file, in order. `CSS` markers sit in the `<style>`');
  w('block, `HTML` in the body, `JS` in the inline script.');
  w();
  w('| lines | region | section | fns |');
  w('|---|---|---|---:|');
  sections.forEach((s, i) => {
    const end = sectionEnd(i);
    const n = fnsIn(s.line, end).length;
    w('| ' + s.line + '-' + end + ' | ' + s.region + ' | ' +
      (s.major ? '**' + s.name + '**' : s.name) + ' | ' + (n || '') + ' |');
  });
  w();

  w('## Functions, by section');
  w();
  w('All ' + fns.length + ' `function` declarations in `index.html`.');
  w();
  sections.forEach((s, i) => {
    const end = sectionEnd(i);
    const list = fnsIn(s.line, end);
    if (!list.length) return;
    w('### ' + s.name + '  <sub>' + s.region + ' &middot; ' + s.line + '-' + end + '</sub>');
    w();
    w('```');
    const width = Math.max(...list.map((f) => f.name.length));
    list.forEach((f) => {
      const args = f.args.length > 40 ? f.args.slice(0, 40) + '...' : f.args;
      w(String(f.line).padStart(5) + '  ' + pad(f.name, width) + '(' + args + ')');
    });
    w('```');
    w();
  });

  w('## Top-level constants');
  w();
  w('Cached `getElementById` handles are omitted - there are dozens and they all');
  w('sit in **Screen management**.');
  w();
  w('```');
  const cw = Math.max(...consts.map((c) => c.name.length));
  consts.forEach((c) => w(String(c.line).padStart(5) + '  ' + pad(c.name, cw) + ' = ' + c.val));
  w('```');
  w();

  w('## Levels');
  w();
  w('Par comes from `PAR_CONTRACT`; regenerate it with `node solve.js --contract`.');
  w();
  w('| # | slug | name | grid | par | defined |');
  w('|---:|---|---|---|---:|---:|');
  levels.forEach((l, i) => {
    w('| ' + (i + 1) + ' | `' + l.slug + '` | ' + l.name + ' | ' + l.cols + 'x' + l.rows +
      ' | ' + (l.par === undefined ? '-' : l.par) + ' | ' + l.line + ' |');
  });
  w();

  w('## Test groups');
  w();
  w('The ' + groups.length + ' assertion groups inside `selfTest()`, so you can find the test');
  w('for a behaviour without reading the whole suite.');
  w();
  w('```');
  groups.forEach((g) => w(String(g.line).padStart(5) + '  ' + g.name));
  w('```');
  w();

  w('## The tooling seam');
  w();
  w('`window.__wiredDev` is the only surface `test.js` and `solve.js` reach through.');
  w('Renaming anything in it breaks both runners.');
  w();
  w('```');
  w(dev.join(', '));
  w('```');
  w();

  w('## localStorage keys');
  w();
  w('All prefixed with `STORE_PREFIX`. Changing the prefix orphans every save.');
  w();
  w('```');
  keys.forEach((k) => w("STORE_PREFIX + '" + k + "'"));
  w('```');
  w();

  w('## DOM ids');
  w();
  w(ids.length + ' ids, with the line each is declared on.');
  w();
  w('```');
  const iw = Math.max(...ids.map((x) => x.id.length));
  ids.forEach((x) => w(pad(x.id, iw) + '  ' + x.line));
  w('```');

  return o.join('\n').replace(/\n+$/, '') + '\n';
}

/* --------------------------------- main ----------------------------------- */

const norm = (s) => s.replace(/\r\n/g, '\n');

function main() {
  const next = render();
  if (CHECK) {
    if (!fs.existsSync(OUT)) {
      console.error('CODE-MAP.md is missing. Run: node codemap.js');
      process.exit(1);
    }
    if (norm(fs.readFileSync(OUT, 'utf8')) !== next) {
      console.error('CODE-MAP.md is out of date with index.html. Run: node codemap.js');
      process.exit(1);
    }
    console.log('CODE-MAP.md is current');
    return;
  }
  fs.writeFileSync(OUT, next);
  console.log('CODE-MAP.md written - ' + next.split('\n').length + ' lines');
}

main();
