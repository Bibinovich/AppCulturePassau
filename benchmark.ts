import { db } from "./server/db";
import { storage } from "./server/storage";
import { users, perks, perkRedemptions } from "./shared/schema";
import { eq } from "drizzle-orm";

async function run() {
  try {
    console.log("Setting up baseline environment...");

    // Create a dummy user
    const username = `bench_${Date.now()}`;
    const [user] = await db.insert(users).values({ username, password: "pw" }).returning();

    // Create some dummy perks
    const createdPerks = [];
    for (let i = 0; i < 50; i++) {
      const [perk] = await db.insert(perks).values({
        title: `Perk ${i}`,
        perkType: "discount_percent",
      }).returning();
      createdPerks.push(perk);
    }

    // Create redemptions
    for (let i = 0; i < 200; i++) {
      await db.insert(perkRedemptions).values({
        userId: user.id,
        perkId: createdPerks[i % createdPerks.length].id,
      });
    }

    console.log(`Setup done for user ${user.id} with 200 redemptions. Measuring...`);

    const start = performance.now();
    const results = await storage.getUserRedemptions(user.id);
    const end = performance.now();

    console.log(`getUserRedemptions returned ${results.length} items`);
    console.log(`Execution time: ${(end - start).toFixed(2)} ms`);

    process.exit(0);
  } catch (error) {
    console.error("Benchmark failed", error);
    process.exit(1);
  }
}

run();
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

function benchmarkOptimized() {
  const start = performance.now();
  for (let i = 0; i < 100; i++) {
    const savedSet = new Set(savedEvents);
    const list = sampleEvents.filter(e => savedSet.has(e.id));
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

const baselineTime = benchmarkBaseline();
const optimizedTime = benchmarkOptimized();

console.log(`Baseline: ${baselineTime.toFixed(2)}ms`);
console.log(`Optimized: ${optimizedTime.toFixed(2)}ms`);
console.log(`Improvement: ${((baselineTime - optimizedTime) / baselineTime * 100).toFixed(2)}%`);
const baselineTime = runBaseline();
console.log(`Baseline (4 calls per render): ${baselineTime.toFixed(2)}ms`);

const optimizedTime = runOptimized();
console.log(`Optimized (1 call per render): ${optimizedTime.toFixed(2)}ms`);

const improvement = ((baselineTime - optimizedTime) / baselineTime) * 100;
console.log(`Improvement: ${improvement.toFixed(2)}% faster`);
