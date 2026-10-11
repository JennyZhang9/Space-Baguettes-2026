// Lightweight verification of page generation and numerical invariants.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const app = { innerHTML: '' };
const results = { innerHTML: '' };
const context = vm.createContext({ window: {}, document: { querySelector: s => s === '#app' ? app : s === '#results' ? results : null, querySelectorAll: () => [] }, setInterval, clearInterval, setTimeout, console });
vm.runInContext(fs.readFileSync(__dirname + '/data.js', 'utf8'), context);
context.RESEARCH = context.window.RESEARCH;
vm.runInContext(fs.readFileSync(__dirname + '/app.js', 'utf8'), context);
assert.equal(context.RESEARCH.length, 49);
assert.equal(context.RESEARCH[12][1], null);
assert.equal(context.RESEARCH[12][3], null);
for (const page of ['dashboard', 'lab', 'habitat', 'wellbeing', 'science']) {
  vm.runInContext(`page='${page}'; render()`, context);
  assert.ok(app.innerHTML.includes('<main'));
  assert.ok(!app.innerHTML.includes('NaN'));
}
vm.runInContext("mode='mission'; scenario='gradual'; severity=12; noise=0; dropout=0; threshold=2.5", context);
assert.equal(vm.runInContext('series()[0].hr', context), 94);
assert.equal(vm.runInContext('series()[48].hr', context), 102);
assert.ok(vm.runInContext('analyze(series()).some(r=>r.alert)', context));
vm.runInContext('evaluate()', context);
assert.ok(results.innerHTML.includes('Personalized EWMA'));
assert.ok(!results.innerHTML.includes('NaN'));
vm.runInContext("mode='mission'; scenario='dropout'", context);
assert.ok(vm.runInContext('series().some(r=>r.hr===null)', context));
console.log('Verified: five page renders, source sample count, preserved nulls, injection boundaries, sustained-change detection, dropout handling and calculated evaluation output.');
context.MutationObserver = class { observe() {} };
vm.runInContext(fs.readFileSync(__dirname + '/ml.js', 'utf8'), context);
vm.runInContext("mode='research'; const mlA=window.trainIsolationForest(series(0,'stable')); const mlB=window.trainIsolationForest(series(0,'stable'));", context);
assert.equal(vm.runInContext('mlA.samples', context), 15);
assert.equal(vm.runInContext('mlA.trees', context), 64);
assert.equal(vm.runInContext('mlA.score(series()[12])', context), null);
assert.equal(vm.runInContext('mlA.score(series()[20])', context), vm.runInContext('mlB.score(series()[20])', context));
assert.ok(vm.runInContext("series(0,'stable').filter(r=>[r.hr,r.resp,r.spo2].every(Number.isFinite)).every(r=>mlA.score(r)>0&&mlA.score(r)<=1)", context));
console.log('Verified ML: 64 trees, 15 complete real training samples, deterministic scores, missing-feature exclusion and scores in (0,1].');
