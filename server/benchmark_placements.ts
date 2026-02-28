import { db } from "./db";
import { eq } from "drizzle-orm";
import { sponsors, sponsorPlacements } from "@shared/schema";
import { storage } from "./storage";

async function runBenchmark() {
  console.log("Setting up benchmark data...");

  // Insert 100 sponsors
  const sponsorIds: string[] = [];
  for (let i = 0; i < 100; i++) {
    const s = await storage.createSponsor({
      name: `Benchmark Sponsor ${i}`,
      description: "For benchmarking",
    });
    sponsorIds.push(s.id);
  }

  // Insert 100 active placements
  const now = new Date();
  const future = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30); // 30 days from now
  const past = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 10); // 10 days ago

  for (const sponsorId of sponsorIds) {
    await storage.createPlacement({
      sponsorId,
      placementType: "banner",
      startDate: past,
      endDate: future,
      weight: Math.floor(Math.random() * 100),
    });
  }

  console.log(`Inserted ${sponsorIds.length} sponsors and placements.`);

  console.log("Warming up...");
  for (let i = 0; i < 5; i++) {
    await storage.getActivePlacements("banner");
  }

  console.log("Running benchmark...");
  const iterations = 50;
  let totalTime = 0;

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    const results = await storage.getActivePlacements("banner");
    const end = performance.now();
    totalTime += (end - start);

    if (i === 0) {
      console.log(`Fetched ${results.length} placements on first run.`);
    }
  }

  console.log(`Average time over ${iterations} iterations: ${(totalTime / iterations).toFixed(2)}ms`);

  console.log("Cleaning up...");
  // Cleanup
  for (const id of sponsorIds) {
    // Note: getActivePlacements might still return them if we don't really delete.
    // However, our deleteSponsor just sets status = archived.
    // For pure cleanup, let's just delete directly from DB to avoid cluttering.
    await db.delete(sponsorPlacements).where(eq(sponsorPlacements.sponsorId, id));
    await db.delete(sponsors).where(eq(sponsors.id, id));
  }

  process.exit(0);
}

runBenchmark().catch(console.error);
