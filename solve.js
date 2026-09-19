#!/usr/bin/env node
// Authoring tool: proves each level routes, computes its par, and verifies that
// par by replaying it through the real game engine.
//
//   node solve.js              every shipped level, plus today's daily
//   node solve.js mainframe    one level by slug
//   node solve.js --contract   emit the solution contract as JSON
//
// Par is in MOVES. The game is turn-based: one player action is one tick, so a
// par of 34 is 34 decisions rather than any number of seconds. Nothing about
// the search changed when the metronome went away, because the schedule it
// searches was always a list of turns.
//
// Par is ACHIEVABLE, not proven minimal — the schedule search only considers
// building each wire contiguously, while the game also allows parking a
// half-built wire to run another. A player can therefore beat par. That's the
// safe direction: every par ships with a witness we replay, so gold is always
// attainable. A par that was too low would make gold impossible.

const { loadGame } = require('./harness');

const args = process.argv.slice(2);
const WANT_CONTRACT = args.includes('--contract');
const slugFilter = args.filter(a => !a.startsWith('--'))[0] || null;

function main(){
  const g = loadGame();
  const dev = g.__wiredDev;
  if(!dev){ console.error('game did not expose __wiredDev'); process.exit(1); }

  const { solveLevel, replaySolution, LEVELS, generateDailyLevel } = dev;

  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const levels = LEVELS.concat([generateDailyLevel(dateStr)])
                       .filter(lv => !slugFilter || lv.slug === slugFilter);

  if(!levels.length){ console.error('no level matching slug: ' + slugFilter); process.exit(1); }

  const contract = {};
  let failures = 0;

  levels.forEach(lv => {
    const t0 = Date.now();
    const sol = solveLevel(lv);
    const ms = Date.now() - t0;

    if(sol.status !== 'solved'){
      failures++;
      const why = sol.status === 'unknown'
        ? 'search budget exhausted — NOT proven unsolvable, just unverified'
        : sol.status === 'impossible'
          ? 'proven unroutable — this level cannot ship'
          : sol.status;
      console.log(`${lv.slug.padEnd(22)} ${'FAILED'.padEnd(10)} ${why}`);
      return;
    }

    // The claim is only worth anything if the real engine agrees.
    const replay = replaySolution(lv, sol);
    const good = replay.won && replay.ticks === sol.par && replay.zaps === 0 && !replay.illegal;
    if(!good) failures++;

    console.log(
      `${lv.slug.padEnd(22)} par ${String(sol.par).padStart(3)} moves` +
      `  wire ${String(sol.totalCells).padStart(3)} cells` +
      `  ${sol.routingExhaustive ? 'routing proven minimal' : 'routing NOT exhaustive'}` +
      `  replay ${good ? 'OK' : 'MISMATCH won=' + replay.won + ' ticks=' + replay.ticks + ' zaps=' + replay.zaps + (replay.illegal ? ' ' + replay.illegal : '')}` +
      `  ${ms}ms`
    );

    contract[lv.slug] = {
      par: sol.par,
      totalCells: sol.totalCells,
      order: sol.order,
      paths: sol.paths,
      actions: sol.actions
    };
  });

  if(WANT_CONTRACT){
    console.log('');
    console.log(JSON.stringify(contract, null, 2));
  }

  console.log('');
  console.log(failures ? `${failures} level(s) FAILED` : 'all levels solved and replayed clean');
  process.exit(failures ? 1 : 0);
}

main();
