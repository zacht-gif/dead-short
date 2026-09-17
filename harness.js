// Loads index.html's inline game script into a stub DOM under node:vm.
//
// Shared by test.js (runs the in-page selfTest) and solve.js (computes par for
// levels). One loader, so a stub that's wrong shows up in both places at once
// rather than one of them quietly disagreeing with the other.
//
// The stub is deliberately minimal. Anything the game needs that isn't here
// throws immediately, which is far easier to diagnose than a silently wrong
// result from an over-helpful fake.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

function ctxStub(){
  // Every canvas call is a no-op; nothing under test reads back from the 2D
  // context. A Proxy means a newly-used ctx method never breaks the harness.
  return new Proxy({}, {
    get(t, k){
      if(k === 'canvas') return undefined;
      if(!(k in t)) t[k] = () => {};
      return t[k];
    },
    set(t, k, v){ t[k] = v; return true; }
  });
}

// One focus owner for the whole stub document, so el.focus() and reads of
// document.activeElement agree. Without this, focus() was a no-op and every
// question about what is focused answered "nothing" - which the game would
// have read as "the board is not focused", quietly and wrongly.
const focusState = { el: null };

function makeEl(tag){
  return {
    tagName: String(tag || 'div').toUpperCase(),
    children: [],
    style: { setProperty(){}, removeProperty(){}, getPropertyValue(){ return ''; } },
    classList: {
      _s: new Set(),
      add(...c){ c.forEach(x => this._s.add(x)); },
      remove(...c){ c.forEach(x => this._s.delete(x)); },
      contains(c){ return this._s.has(c); },
      toggle(c, force){
        const on = force === undefined ? !this._s.has(c) : !!force;
        if(on) this._s.add(c); else this._s.delete(c);
        return on;
      }
    },
    textContent: '', innerHTML: '', className: '', value: '',
    checked: false, offsetWidth: 0, width: 0, height: 0,
    appendChild(c){ this.children.push(c); return c; },
    removeChild(c){ this.children = this.children.filter(x => x !== c); return c; },
    addEventListener(){}, removeEventListener(){},
    setAttribute(){}, getAttribute(){ return null; },
    querySelector(){ return makeEl('div'); },
    querySelectorAll(){ return []; },
    getBoundingClientRect(){ return { left:0, top:0, right:100, bottom:100, width:100, height:100 }; },
    getContext(){ return ctxStub(); },
    focus(){ focusState.el = this; },
    blur(){ if(focusState.el === this) focusState.el = null; },
    click(){}
  };
}

function makeDocument(){
  const byId = Object.create(null);
  return {
    documentElement: makeEl('html'),
    body: makeEl('body'),
    // Readable and assignable: the game reads it to decide whether the board
    // owns Tab, and the suite writes it to place focus without a real DOM.
    get activeElement(){ return focusState.el; },
    set activeElement(v){ focusState.el = v; },
    getElementById(id){
      if(!byId[id]) byId[id] = makeEl('div');
      return byId[id];
    },
    createElement(tag){ return makeEl(tag); },
    querySelector(){ return makeEl('div'); },
    querySelectorAll(){ return []; },
    addEventListener(){}, removeEventListener(){}
  };
}

function makeLocalStorage(){
  const store = new Map();
  return {
    getItem(k){ return store.has(String(k)) ? store.get(String(k)) : null; },
    setItem(k, v){ store.set(String(k), String(v)); },
    removeItem(k){ store.delete(String(k)); },
    clear(){ store.clear(); },
    get length(){ return store.size; }
  };
}

function buildSandbox(){
  const sandbox = {
    document: makeDocument(),
    localStorage: makeLocalStorage(),
    console, performance, URLSearchParams, btoa, atob,
    Math, JSON, Date, Number, String, Array, Object, Set, Map, Boolean, RegExp, Error,
    Int8Array, Int16Array, Int32Array, Uint8Array, Uint16Array, Uint32Array, Float64Array,
    isNaN, parseInt, parseFloat,
    location: { search: '', href: 'https://example.invalid/index.html', hash: '' },
    navigator: { userAgent: 'node-harness' },   // no vibrate, share, or serviceWorker
    devicePixelRatio: 1,
    innerWidth: 1280,
    innerHeight: 800,
    // No-ops on purpose: a real rAF would spin the game loop forever, and a real
    // setTimeout would hold the process open for the intro animation.
    requestAnimationFrame(){ return 0; },
    cancelAnimationFrame(){},
    setTimeout(){ return 0; },
    clearTimeout(){},
    setInterval(){ return 0; },
    clearInterval(){},
    matchMedia(){ return { matches:false, addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){} }; },
    getComputedStyle(){ return { getPropertyValue(){ return ''; } }; },
    addEventListener(){}, removeEventListener(){},
    alert(){}
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  return sandbox;
}

function extractInlineScript(html){
  const matches = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)];
  if(!matches.length) throw new Error('no inline <script> found in index.html');
  // The game is the largest inline block; anything else is incidental.
  return matches.map(m => m[1]).sort((a, b) => b.length - a.length)[0];
}

// Returns the populated sandbox, with __wiredSelfTest and __wiredDev on it.
function loadGame(htmlPath){
  const file = htmlPath || path.join(__dirname, 'index.html');
  const script = extractInlineScript(fs.readFileSync(file, 'utf8'));
  const sandbox = buildSandbox();
  vm.createContext(sandbox);
  new vm.Script(script, { filename: 'index.html<script>' })
    .runInContext(sandbox, { timeout: 60000 });
  return sandbox;
}

module.exports = { loadGame, buildSandbox, extractInlineScript };
