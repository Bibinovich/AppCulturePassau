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
