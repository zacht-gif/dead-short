#!/usr/bin/env node
// Headless runner for Dead Short's in-page self test.
//
// The game is one HTML file with no module boundary, which makes it look
// untestable. It isn't: the assertions live inside index.html as selfTest(),
// and this runner only supplies an environment. It loads the inline script into
// a stub DOM (see harness.js) and calls the same function index.html?test=1
// calls in a browser — so there is exactly one definition of what "passing"
// means, not two that can drift.
//
//   node test.js            run the suite
//   node test.js --verbose  also list the passing assertions
//
// Exits non-zero on any failure, so it can gate a commit.

const { loadGame } = require('./harness');

const VERBOSE = process.argv.includes('--verbose') || process.argv.includes('-v');

function main(){
  let sandbox;
  try{
    sandbox = loadGame();
  } catch(err){
    console.error('FAILED to evaluate the game script:\n' + (err && err.stack || err));
    process.exit(1);
  }

  if(typeof sandbox.__wiredSelfTest !== 'function'){
    console.error('FAILED: the game did not expose __wiredSelfTest — is selfTest() still defined?');
    process.exit(1);
  }

  let report;
  try{
    report = sandbox.__wiredSelfTest();
  } catch(err){
    console.error('FAILED inside selfTest:\n' + (err && err.stack || err));
    process.exit(1);
  }

  const pad = (s, n) => (s + ' '.repeat(n)).slice(0, n);
  report.results.forEach(r => {
    if(r.pass && !VERBOSE) return;
    console.log((r.pass ? '  ok  ' : ' FAIL ') + pad(r.name, 54) + (r.detail ? '  ' + r.detail : ''));
  });

  console.log('');
  console.log(`${report.passed}/${report.total} assertions passed` +
              (report.failed ? `, ${report.failed} FAILED` : ''));
  process.exit(report.failed ? 1 : 0);
}

main();
