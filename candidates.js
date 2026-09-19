#!/usr/bin/env node
// Authoring tool: searches for BOARDS that hit a target difficulty, and proves
// each one with the game's own solver before proposing it.
//
//   node candidates.js                  search every rung, print the best fits
//   node candidates.js --rung 50        just that rung
//   node candidates.js --tries 6000     bigger search budget
//   node candidates.js --seed 12        a different (still reproducible) search
//   node candidates.js --json           machine-readable, for piping
//
// WHY THIS EXISTS
//
// Measured on 2026-09-18, the shipped campaign has a trap density of 0% on
// eight of its ten levels. Trap - the share of plausible routes that seal the
// board - is the axis the Board Sealed warning exists to serve and the one the
// store page leads with, and a player does not meet it until level 9. The
// randomly generated daily, meanwhile, averaged 46% trap over fourteen
// consecutive days with every single day non-zero. A seeded RNG was producing
// more interesting boards on the game's headline axis than the hand-authored
// set was.
//
// So this does not design levels. It SEARCHES for candidates, scores them on
// the same three axes README describes, and hands back the ones that fit each
// rung of a ramp - with a share code so each can be pasted straight into the
// editor and played. Choosing and polishing stays a human job; what changes is
// that the choosing happens over verified proposals instead of a blank grid.
//
// NOTHING HERE TOUCHES THE GAME. It reads through the same __wiredDev seam that
// solve.js uses, so a board this proposes is proved by the exact solver that
// will later gate it in build.js.

const { loadGame } = require('./harness');

const args = process.argv.slice(2);
const JSON_OUT = args.includes('--json');
function argOf(name, dflt){
  const i = args.indexOf(name);
  if(i === -1 || i + 1 >= args.length) return dflt;
  const v = Number(args[i + 1]);
  return Number.isFinite(v) ? v : dflt;
}
const TRIES = argOf('--tries', 3000);
const SEED = argOf('--seed', 1);
const ONLY_RUNG = args.indexOf('--rung') !== -1 ? argOf('--rung', null) : null;

// The ramp we are searching for. Trap is the axis that is missing, so the rungs
// are NAMED by it - but a rung is a triple, not a number.
//
// The first version of this scored on trap alone, and the rung-50 pick came
// back with detour 0 and a single component in a corner: a board that traps
// beautifully and asks for no routing at all. Trap without detour is a guessing
// game rather than a puzzle, so each rung carries a detour floor that rises
// with it. The shipped set's detour ramp (0 -> 12) is the one axis already in
// good shape, and this keeps it.
const RUNGS = [
  { trap:  0, minDetour: 0,  minComponents: 1, label: 'tutorial' },
  { trap: 15, minDetour: 2,  minComponents: 2, label: 'early' },
  { trap: 30, minDetour: 5,  minComponents: 2, label: 'mid' },
  { trap: 50, minDetour: 8,  minComponents: 3, label: 'late' },
  { trap: 75, minDetour: 10, minComponents: 3, label: 'finale' },
];

// Boards stay inside the editor's 7x7 cap so that EVERY proposal can be pasted
// into the editor and played immediately. Three shipped levels are 7x8, so this
// is a deliberate restriction of the search rather than a rule about levels -
// a code for a taller board decodes, but the editor's size selector cannot
// offer it, which would break the one loop this tool exists to close.
const MAX_DIM = 7, MIN_DIM = 5;

const PALETTE = ['#ff5d6c', '#4fd6ff', '#f5b942', '#45e0a8'];

// Deterministic RNG, same shape the game uses for the daily. A search you
// cannot re-run is a search whose results you cannot check.
function mulberry32(a){
  return function(){
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function main(){
  const g = loadGame();
  const dev = g.__wiredDev;
  if(!dev){ console.error('game did not expose __wiredDev'); process.exit(1); }
  const { solveLevel, TICK_HZ, loopPath, trapMeasure, measurePressure, encodeLevel } = dev;

  for(const name of ['solveLevel','loopPath','trapMeasure','measurePressure','encodeLevel']){
    if(typeof dev[name] !== 'function'){
      console.error('__wiredDev.' + name + ' is missing - the seam moved.');
      process.exit(1);
    }
  }

  const rand = mulberry32(SEED >>> 0);
  const ri = (n)=> Math.floor(rand() * n);
  const pick = (arr)=> arr[ri(arr.length)];
  // loopPath() walks c+=dc and r+=dr TOGETHER and stops only on an exact hit,
  // so a segment that is neither axis-aligned nor a perfect diagonal never
  // terminates - it pushes cells until the heap dies. That is not a bug in the
  // game: decodeLevel already refuses such waypoints ("loopPath only
  // understands straight runs between waypoints"), so the untrusted path is
  // guarded. It IS a trap for a generator, and this one fell in it on its first
  // run. The guard is repeated here so the same mistake fails loudly next time
  // rather than hanging.
  const mkPatrol = (ticksPerCell, waypoints)=>{
    for(let i=0;i<waypoints.length-1;i++){
      const a = waypoints[i], b = waypoints[i+1];
      if(a[0] !== b[0] && a[1] !== b[1]) return null;
      if(a[0] === b[0] && a[1] === b[1]) return null;
    }
    return { ticksPerCell, waypoints, path: loopPath(waypoints) };
  };

  // ---- board shapes ------------------------------------------------------
  //
  // Four placements rather than one. The daily only ever produces the "shifted"
  // shape, and the whole point of the search is to find out empirically which
  // shapes carry trap rather than to assume it - so the generator offers
  // several and the measurement decides.

  function placeShifted(cols, rows, nPairs){
    // The daily's shape: top and bottom, order preserved so the pairs can
    // always route without crossing, shifted so they rarely go straight down.
    const pool = Array.from({length:cols}, (_,i)=>i);
    const top = [];
    for(let i=0;i<nPairs;i++) top.push(pool.splice(ri(pool.length),1)[0]);
    top.sort((a,b)=>a-b);
    const shift = 1 + ri(2);
    const bot = top.map(c=>Math.min(cols-1, c + shift));
    if(new Set(bot).size !== bot.length) return null;
    return top.map((c,i)=>({ color:PALETTE[i % PALETTE.length], a:[c,0], b:[bot[i], rows-1] }));
  }

  function placeNested(cols, rows, nPairs){
    // Endpoints that INTERLEAVE, which is the fault-line shape: a pair routed
    // along the outside strands the pair that needed to nest inside it. This is
    // the shape trap is expected to come from, and the numbers say whether it
    // actually does.
    if(nPairs * 2 > cols) return null;
    const out = [];
    for(let i=0;i<nPairs;i++){
      const left = i, right = cols - 1 - i;
      if(left >= right) return null;
      out.push({ color:PALETTE[i % PALETTE.length], a:[left, 0], b:[right, 0] });
    }
    return out;
  }

  function placeSameEdge(cols, rows, nPairs){
    // Both pads on one edge, like elbow - the wire has to leave and come back,
    // so it sweeps territory another pair may need.
    const out = [];
    const used = new Set();
    for(let i=0;i<nPairs;i++){
      const row = ri(rows);
      const c1 = ri(cols), c2 = ri(cols);
      if(Math.abs(c1 - c2) < 2) return null;
      const k1 = c1 + ',' + row, k2 = c2 + ',' + row;
      if(used.has(k1) || used.has(k2)) return null;
      used.add(k1); used.add(k2);
      out.push({ color:PALETTE[i % PALETTE.length], a:[c1,row], b:[c2,row] });
    }
    return out;
  }

  function placeOpposedEdges(cols, rows, nPairs){
    // Left edge to right edge, rows shuffled so the pairs cross each other's
    // natural lane and the order they energise starts to matter.
    // Two independent pools, because a left pad and a right pad are different
    // cells - but two pairs sharing a right pad would be two terminals on one
    // cell, which is not a board.
    const leftPool = Array.from({length:rows}, (_,i)=>i);
    const rightPool = Array.from({length:rows}, (_,i)=>i);
    if(rows < nPairs) return null;
    const out = [];
    for(let i=0;i<nPairs;i++){
      const ra = leftPool.splice(ri(leftPool.length),1)[0];
      const rb = rightPool.splice(ri(rightPool.length),1)[0];
      out.push({ color:PALETTE[i % PALETTE.length], a:[0, ra], b:[cols-1, rb] });
    }
    return out;
  }

  const SHAPES = [
    ['shifted', placeShifted],
    ['nested', placeNested],
    ['same-edge', placeSameEdge],
    ['opposed', placeOpposedEdges],
  ];

  function randomBoard(n){
    const cols = MIN_DIM + ri(MAX_DIM - MIN_DIM + 1);
    const rows = MIN_DIM + ri(MAX_DIM - MIN_DIM + 1);
    const nPairs = 2 + ri(3);                       // 2..4
    const [shapeName, place] = pick(SHAPES);
    const terminals = place(cols, rows, nPairs);
    if(!terminals) return null;

    const taken = new Set();
    terminals.forEach(t=>{ taken.add(t.a.join(',')); taken.add(t.b.join(',')); });

    // Components: either a partial wall (the daily's funnel) or scatter.
    const blocked = [];
    if(rand() < 0.6){
      const wallRow = 1 + ri(Math.max(1, rows - 2));
      for(let c=0;c<cols;c++){
        if(rand() < 0.45) continue;
        if(taken.has(c + ',' + wallRow)) continue;
        blocked.push([c, wallRow]);
      }
    } else {
      const count = 1 + ri(4);
      for(let k=0;k<count;k++){
        const c = ri(cols), r = ri(rows);
        if(taken.has(c + ',' + r)) continue;
        if(blocked.some(b=>b[0]===c && b[1]===r)) continue;
        blocked.push([c, r]);
      }
    }
    if(!blocked.length || blocked.length >= cols * rows / 3) return null;

    // Hazards: 1..3, patrols and gates. Every shipped level from 3 onward has
    // exactly 2, so the search is allowed to go past that on purpose.
    const obstacles = [];
    const nHaz = 1 + ri(3);
    for(let k=0;k<nHaz;k++){
      if(rand() < 0.65){
        // Both waypoints share a row (horizontal) or a column (vertical). The
        // shared coordinate has to be picked ONCE - drawing a fresh random one
        // for each end makes a diagonal, which is what hung the first run.
        let straight;
        if(rand() < 0.5){
          const row = ri(rows);
          straight = [[0, row], [cols-1, row]];
        } else {
          const col = ri(cols);
          straight = [[col, 0], [col, rows-1]];
        }
        const ob = mkPatrol(2 + ri(2), straight);
        if(!ob) continue;
        obstacles.push(ob);
      } else {
        const c = ri(cols), r = ri(rows);
        if(taken.has(c + ',' + r)) continue;
        if(blocked.some(b=>b[0]===c && b[1]===r)) continue;
        const periodTicks = 8 + ri(6);
        obstacles.push({ type:'gate', cell:[c,r], periodTicks,
                         onTicks: 3 + ri(3), phaseTicks: ri(periodTicks) });
      }
    }
    if(!obstacles.length) return null;

    return { slug:'cand-' + n, name:'Candidate ' + n, cols, rows,
             terminals, blocked, obstacles, _shape: shapeName };
  }

  // ---- search ------------------------------------------------------------
  const found = [];
  let solved = 0, rejectedUnsolved = 0, rejectedUncertain = 0, malformed = 0;

  for(let n = 0; n < TRIES; n++){
    const lv = randomBoard(n);
    if(!lv){ malformed++; continue; }

    const sol = solveLevel(lv);
    if(!sol || sol.status !== 'solved'){ rejectedUnsolved++; continue; }
    solved++;

    const trap = trapMeasure(lv);
    // README's rule, applied here: a capped enumeration reports NO density
    // rather than a low one, because routes that were never generated would
    // silently count as safe and drag the figure toward zero. A null density is
    // a refusal, not a zero, so it is dropped rather than bucketed at rung 0.
    if(trap.density === null){ rejectedUncertain++; continue; }
    const uncertainShare = trap.uncertain / Math.max(1, trap.considered + trap.uncertain);
    if(uncertainShare > 0.2){ rejectedUncertain++; continue; }

    const pres = measurePressure(lv, sol);
    found.push({
      lv, shape: lv._shape,
      size: lv.cols + 'x' + lv.rows,
      pairs: lv.terminals.length,
      blocked: lv.blocked.length,
      hazards: lv.obstacles.length,
      par: sol.par,
      secs: +(sol.par / TICK_HZ).toFixed(1),
      cells: sol.totalCells,
      detour: pres.detour,
      holds: pres.holds,
      trapPct: +(trap.density * 100).toFixed(1),
      considered: trap.considered,
      uncertainShare: +(uncertainShare * 100).toFixed(1),
    });
  }

  // ---- pick the best fit per rung ---------------------------------------
  // Closest trap to the target, then prefer a board whose hazards actually bite
  // (holds 2..8 - README's band, where 56 was found to be boring rather than
  // hard) and whose trap number rests on more routes rather than fewer.
  function scoreFor(c, rung){
    const trapErr = Math.abs(c.trapPct - rung.trap);
    // Floors, not targets: being over is fine, being under is the thing that
    // makes a board the wrong rung. Weighted heavily enough that a perfect trap
    // number cannot buy its way past an empty board.
    const detourShort = Math.max(0, rung.minDetour - c.detour) * 6;
    const partsShort = Math.max(0, rung.minComponents - c.blocked) * 8;
    // README's band: hazards should constrain the run, but 56 holds is a wire
    // idling for nine seconds - boring rather than hard.
    const holdsPenalty = (c.holds >= 2 && c.holds <= 8) ? 0 : 12;
    // A trap figure resting on a handful of routes is not worth much.
    const thinPenalty = c.considered < 20 ? 10 : 0;
    return trapErr + detourShort + partsShort + holdsPenalty + thinPenalty;
  }

  const rungs = (ONLY_RUNG === null
    ? RUNGS
    : RUNGS.filter(r=>r.trap === ONLY_RUNG));
  if(!rungs.length){
    console.error('no rung with trap ' + ONLY_RUNG + '. Rungs: ' +
                  RUNGS.map(r=>r.trap).join(', '));
    process.exit(1);
  }
  // What a pick FAILS to meet, named. A search reports the best thing it found,
  // which is not the same as a thing that fits - and a board printed under
  // "finale" with no note reads as a finale. The shortfalls are the difference
  // between a proposal and a recommendation, so they are printed, not buried in
  // the score.
  function shortfallsOf(c, rung){
    const out = [];
    if(c.detour < rung.minDetour) out.push('detour ' + c.detour + ' < ' + rung.minDetour);
    if(c.blocked < rung.minComponents) out.push('components ' + c.blocked + ' < ' + rung.minComponents);
    if(c.holds < 2) out.push('holds ' + c.holds + ' - hazards barely bite');
    if(c.holds > 8) out.push('holds ' + c.holds + ' - a lot of idle waiting');
    if(c.considered < 20) out.push('trap rests on only ' + c.considered + ' routes');
    if(Math.abs(c.trapPct - rung.trap) > 12) out.push('trap ' + c.trapPct + '% vs target ' + rung.trap + '%');
    return out;
  }

  const report = rungs.map(rung=>{
    const ranked = found
      .map(c=>({ c, s: scoreFor(c, rung) }))
      .sort((a,b)=> a.s - b.s || a.c.par - b.c.par)
      .slice(0, 3)
      .map(x=>({ ...x.c, shortfalls: shortfallsOf(x.c, rung) }));
    return { rung, picks: ranked };
  });

  if(JSON_OUT){
    console.log(JSON.stringify({
      seed: SEED, tries: TRIES,
      stats: { solved, rejectedUnsolved, rejectedUncertain, malformed, scored: found.length },
      rungs: report.map(r=>({
        target: r.rung.trap, label: r.rung.label,
        minDetour: r.rung.minDetour, minComponents: r.rung.minComponents,
        picks: r.picks.map(c=>({
          shape:c.shape, size:c.size, pairs:c.pairs, hazards:c.hazards,
          par:c.par, detour:c.detour, holds:c.holds, trapPct:c.trapPct,
          considered:c.considered, shortfalls:c.shortfalls,
          code: encodeLevel(c.lv), level: stripLevel(c.lv),
        })),
      })),
    }, null, 2));
    return;
  }

  console.log('searched ' + TRIES + ' boards (seed ' + SEED + ')');
  console.log('  ' + solved + ' solved, ' + found.length + ' scored, ' +
              rejectedUnsolved + ' unsolvable, ' + rejectedUncertain +
              ' dropped for an uncertain trap number, ' + malformed + ' malformed\n');

  if(!found.length){
    console.log('nothing scored. Raise --tries, or the generator needs loosening.');
    return;
  }

  // What the shapes actually produced, because the point was to find out
  // rather than to assume.
  const byShape = {};
  found.forEach(c=>{
    const b = byShape[c.shape] || (byShape[c.shape] = { n:0, trap:0, best:0 });
    b.n++; b.trap += c.trapPct; b.best = Math.max(b.best, c.trapPct);
  });
  console.log('trap by board shape:');
  Object.keys(byShape).sort().forEach(k=>{
    const b = byShape[k];
    console.log('  ' + k.padEnd(11) + String(b.n).padStart(4) + ' boards   mean ' +
                (b.trap / b.n).toFixed(1).padStart(5) + '%   best ' + b.best.toFixed(1) + '%');
  });
  console.log('');

  report.forEach(({ rung, picks })=>{
    const head = '=== ' + rung.label + ': trap ~' + rung.trap + '%, detour >= ' +
                 rung.minDetour + ', components >= ' + rung.minComponents + ' ';
    console.log(head + '='.repeat(Math.max(3, 74 - head.length)));
    if(!picks.length){ console.log('  no candidate found\n'); return; }
    picks.forEach((c, i)=>{
      console.log('  [' + (i+1) + '] ' + c.shape.padEnd(10) + c.size +
                  '  ' + c.pairs + ' pairs  ' + c.blocked + ' components  ' +
                  c.hazards + ' hazards');
      console.log('      par ' + c.par + ' (' + c.secs + 's)   detour ' + c.detour +
                  '   holds ' + c.holds + '   trap ' + c.trapPct + '%' +
                  '   (' + c.considered + ' routes, ' + c.uncertainShare + '% uncertain)');
      if(c.shortfalls.length){
        console.log('      COMPROMISE: ' + c.shortfalls.join('; '));
      } else {
        console.log('      fits the rung on every axis');
      }
      console.log('      code: ' + encodeLevel(c.lv));
      if(i === 0) console.log('      ' + literalFor(c.lv));
      console.log('');
    });
  });

  console.log('Paste a code into the editor\'s "Paste a board code to load it" to play it.');
  console.log('The literal under each rung\'s first pick drops straight into LEVELS[].');
  console.log('Then: node solve.js <slug>, put par in PAR_CONTRACT, node codemap.js, node build.js.');
}

// The search's own bookkeeping fields have no business in a shipped level.
function stripLevel(lv){
  const { _shape, ...rest } = lv;
  return rest;
}

// A level as it would appear in LEVELS[], in the file's own conventions:
// double quotes for level data, patrol() rather than an expanded path.
function literalFor(lv){
  const cell = (c)=> '[' + c[0] + ',' + c[1] + ']';
  const terms = lv.terminals.map(t=>
    '\n      { color: "' + t.color + '", a:' + cell(t.a) + ', b:' + cell(t.b) + ' },').join('');
  const blocked = lv.blocked.map(cell).join(',');
  const obs = lv.obstacles.map(ob=>{
    if(ob.type === 'gate'){
      return '\n      { type:"gate", cell:' + cell(ob.cell) +
             ', periodTicks:' + ob.periodTicks + ', onTicks:' + ob.onTicks +
             ', phaseTicks:' + ob.phaseTicks + ' },';
    }
    return '\n      patrol(' + ob.ticksPerCell + ', [' +
           ob.waypoints.map(cell).join(',') + ']),';
  }).join('');
  return 'LEVELS[] literal:\n' +
    '    {\n' +
    '      slug: "rename-me", name: "Rename Me", cols: ' + lv.cols + ', rows: ' + lv.rows + ',\n' +
    '      terminals: [' + terms + '\n      ],\n' +
    '      blocked: [' + blocked + '],\n' +
    '      obstacles: [' + obs + '\n      ]\n' +
    '    },';
}

main();
