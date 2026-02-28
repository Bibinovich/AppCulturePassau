import { performance } from 'perf_hooks';
import { sampleEvents } from './data/mockData';

function filterByLocation(country: string, city: string) {
  return <T extends { country: string; city: string }>(items: T[]): T[] => {
    if (!country) return items;
    const countryFiltered = items.filter((item: T) => item.country === country);
    if (!city) return countryFiltered;
    const cityFiltered = countryFiltered.filter((item: T) => item.city === city);
    return cityFiltered.length > 0 ? cityFiltered : countryFiltered;
  };
}

const runFilter = filterByLocation('Australia', 'Sydney');

function runBaseline() {
  const start = performance.now();
  for (let i = 0; i < 10000; i++) {
    const dates = new Set<string>();
    runFilter(sampleEvents).forEach(e => dates.add(e.date));

    // Simulate other parts of the component using it
    const selectedEvents = runFilter(sampleEvents).filter(e => e.date === '2024-05-15');
    const length = runFilter(sampleEvents).length;
    const slice = runFilter(sampleEvents).slice(0, 4);
  }
  const end = performance.now();
  return end - start;
}

function runOptimized() {
  const start = performance.now();
  for (let i = 0; i < 10000; i++) {
    const filteredEvents = runFilter(sampleEvents);

    const dates = new Set<string>();
    filteredEvents.forEach(e => dates.add(e.date));

    // Simulate other parts of the component using the memoized list
    const selectedEvents = filteredEvents.filter(e => e.date === '2024-05-15');
    const length = filteredEvents.length;
    const slice = filteredEvents.slice(0, 4);
  }
  const end = performance.now();
  return end - start;
}

const baselineTime = runBaseline();
console.log(`Baseline (4 calls per render): ${baselineTime.toFixed(2)}ms`);

const optimizedTime = runOptimized();
console.log(`Optimized (1 call per render): ${optimizedTime.toFixed(2)}ms`);

const improvement = ((baselineTime - optimizedTime) / baselineTime) * 100;
console.log(`Improvement: ${improvement.toFixed(2)}% faster`);
