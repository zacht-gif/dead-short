/**
 * publish.mjs — push the game to itch.io with butler, after proving it works.
 *
 *   node publish.mjs            run every gate, then push
 *   node publish.mjs --dry-run  run every gate and stage the tree, push nothing
 *
 * Ported from cut-and-fill's tools/publish.mjs, which states the reason better
 * than a rewrite would: uploading by hand through the dashboard is the step
 * where a rebuild stops being a deploy. The repo can be clean, the tests green,
 * and the thing players load still a month old, because nothing in git touches
 * what itch serves. This makes the upload one command that refuses to run on a
 * broken game.
 *
 * WHAT IS DIFFERENT HERE. cut-and-fill ships a single index.html and its
 * publish script re-implements its own self-contained check. Dead Short already has
 * build.js as the enforcer — seventeen gates — so this runs that instead of
 * duplicating any of it, and stages the same RUNTIME_FILES list build.js zips.
 * There is deliberately no --no-test passthrough: build.js's own comment says
 * not to ship a build you used it on, and the way to honour that is to make it
 * unreachable from the thing that ships.
 *
 * ONE-TIME SETUP, and none of it can be automated from here:
 *
 *   1. The itch project has to EXIST first. butler pushes builds to a project;
 *      it does not create one. Make it on the itch dashboard with Kind of
 *      project: HTML and the URL slug matching ITCH_SLUG below, or the push
 *      fails with a 404 that reads like an auth problem and is not one.
 *
 *   2. butler login
 *      Opens a browser to authenticate against your itch.io account.
 *      Interactive by design — credentials are yours to enter, not a script's.
 *      Already done on this machine for cut-and-fill, and butler's credentials
 *      are per-machine rather than per-project, so this is likely a no-op:
 *      `butler status <any existing target>` tells you without changing
 *      anything.
 *
 *   3. After the FIRST push, open the itch Edit game page and tick
 *      "This file will be played in the browser" for the new channel.
 *      butler cannot set that flag (itch's own docs say so), so until you do,
 *      the pushed build is a DOWNLOAD sitting next to your playable upload.
 *      Check the page actually still plays before deleting the old upload.
 *
 * After that, every later push updates the same channel in place.
 *
 * THE GITHUB PAGES MIRROR IS NOT PUSHED FROM HERE. Pages deploys from the repo
 * on every push to main, so it needs no tooling — and it is kept out of the
 * README and every announcement on purpose. itch ranks partly on plays and
 * views, so a play that lands on Pages is a discovery signal itch never sees.
 */

import { execFileSync } from "node:child_process";
import { mkdirSync, copyFileSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));

/* The itch.io account, and the project slug within it. The slug is part of the
   public URL and cannot be changed later without breaking every link, so it is
   set once, deliberately, rather than defaulted. */
const ITCH_USER = "thornsrl";
const ITCH_SLUG = "dead-short";
const CHANNEL = "html5";

/* Reject anything unrecognised rather than ignoring it. In cut-and-fill a flag
   this script did not understand used to fall straight through to the butler
   push path, so a typo — or a flag added to the docs before the code — would
   publish to the live store page instead of failing. Exactly once was enough.
   Defaulting to the most consequential action on unknown input is the bug. */
const KNOWN = new Set(["--dry-run"]);
const ARGS = process.argv.slice(2);
const unknown = ARGS.filter((a) => !KNOWN.has(a));
if (unknown.length) {
  console.error("PUBLISH FAILED: unrecognised argument" +
    (unknown.length > 1 ? "s" : "") + ": " + unknown.join(", "));
  console.error("        known flags: " + [...KNOWN].join(", "));
  console.error("        nothing was published.");
  process.exit(1);
}
const DRY = ARGS.includes("--dry-run");

/* butler is deliberately NOT put on PATH — editing PATH on this machine has
   cost time before, and a pinned path is the same on both machines. PATH is
   still checked first, so a system install wins if there is one. */
const BUTLER = [
  "butler",
  "C:/dev/tools/butler/butler.exe",
].find((c) => {
  try { execFileSync(c, ["version"], { stdio: "pipe" }); return true; } catch { return false; }
});

function fail(msg) {
  console.error("PUBLISH FAILED: " + msg);
  process.exit(1);
}

/**
 * The list of files that ship, read out of build.js rather than restated here.
 * Two copies of this list is the bug it is worth avoiding: adding an asset and
 * updating only one of them gives a zip and a butler push with different
 * contents, and the difference is invisible until a player 404s.
 */
function runtimeFiles() {
  const src = readFileSync(path.join(ROOT, "build.js"), "utf8");
  const m = src.match(/const RUNTIME_FILES = \[([\s\S]*?)\];/);
  if (!m) fail("could not find RUNTIME_FILES in build.js — has it been renamed?");
  const files = [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
  if (!files.length) fail("RUNTIME_FILES in build.js parsed as empty, which cannot be right");
  if (!files.includes("index.html")) fail("RUNTIME_FILES does not include index.html");
  return files;
}

function main() {
  if (!ITCH_SLUG) {
    fail("ITCH_SLUG is not set in publish.mjs.\n" +
         "        The slug is the project's public URL on itch and cannot be changed\n" +
         "        afterwards without breaking every link, so it is not guessed here.\n" +
         `        Set it, then this pushes to ${ITCH_USER}/<slug>:${CHANNEL}.`);
  }
  const TARGET = `${ITCH_USER}/${ITCH_SLUG}:${CHANNEL}`;

  if (!BUTLER && !DRY) {
    fail("butler not found. Install it to C:/dev/tools/butler/, or put it on PATH.\n" +
         "        https://broth.itch.zone/butler/windows-amd64/LATEST/archive/default");
  }

  // Every gate, including the tests and the solver. If this exits non-zero the
  // game does not go anywhere.
  console.log("Checking the game before it goes anywhere\n");
  try {
    /* STRICT here and only here. Stale screenshots cannot break the game, so
       build.js only warns - but this is the step where stale marketing actually
       reaches a player, and the store page is the one thing a visitor sees
       before deciding whether to click. */
    console.log(execFileSync(process.execPath, [path.join(ROOT, "build.js")],
      { cwd: ROOT, encoding: "utf8",
        env: { ...process.env, DEAD_SHORT_STRICT_SHOTS: "1" } }).trim());
  } catch (e) {
    fail("build.js did not pass, so nothing was published:\n\n" +
         ((e.stdout || "") + (e.stderr || "")).trim());
  }

  // butler pushes a directory, so stage exactly what ships and nothing else:
  // no tools, no docs, no store assets, no .git.
  const stage = path.join(tmpdir(), `deadshort-publish-${process.pid}`);
  rmSync(stage, { recursive: true, force: true });
  mkdirSync(stage, { recursive: true });
  const files = runtimeFiles();
  for (const f of files) {
    const dest = path.join(stage, f);
    mkdirSync(path.dirname(dest), { recursive: true });
    copyFileSync(path.join(ROOT, f), dest);
  }
  console.log(`\nStaged ${files.length} files: ${files.join(", ")}`);

  if (DRY) {
    rmSync(stage, { recursive: true, force: true });
    console.log(`\n--dry-run: every gate passed, nothing pushed. Would push to ${TARGET}.`);
    return;
  }

  console.log(`\nPushing to ${TARGET}`);
  try {
    console.log(execFileSync(BUTLER, ["push", stage, TARGET], { encoding: "utf8" }).trim());
  } catch (e) {
    const text = (e.stdout || "") + (e.stderr || "") + (e.message || "");
    if (/no credentials|not logged in|authenticate/i.test(text)) {
      fail("butler is not logged in. Run this once, in your own terminal:\n" +
           `        ${BUTLER} login`);
    }
    fail("butler push failed:\n" + text);
  } finally {
    rmSync(stage, { recursive: true, force: true });
  }

  console.log("\nPushed. If this was the FIRST push, the build is a download until you");
  console.log('tick "This file will be played in the browser" on the itch Edit game page.');
  console.log(`Confirm https://${ITCH_USER}.itch.io/${ITCH_SLUG} still plays before removing`);
  console.log("the old upload.");
}

main();
