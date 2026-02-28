import { performance } from 'perf_hooks';

const N = 10000;
const M = 1000;

const sampleEvents = Array.from({ length: N }, (_, i) => ({ id: `event_${i}` }));
const savedEvents = Array.from({ length: M }, (_, i) => `event_${i * 2}`);

function benchmarkBaseline() {
  const start = performance.now();
  for (let i = 0; i < 100; i++) {
    const list = sampleEvents.filter(e => savedEvents.includes(e.id));
  }
  const end = performance.now();
  return end - start;
}

function benchmarkOptimized() {
  const start = performance.now();
  for (let i = 0; i < 100; i++) {
    const savedSet = new Set(savedEvents);
    const list = sampleEvents.filter(e => savedSet.has(e.id));
  }
  const end = performance.now();
  return end - start;
}

const baselineTime = benchmarkBaseline();
const optimizedTime = benchmarkOptimized();

console.log(`Baseline: ${baselineTime.toFixed(2)}ms`);
console.log(`Optimized: ${optimizedTime.toFixed(2)}ms`);
console.log(`Improvement: ${((baselineTime - optimizedTime) / baselineTime * 100).toFixed(2)}%`);
