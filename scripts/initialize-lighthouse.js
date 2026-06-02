import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, "../src/data/portfolios.json");
const data = JSON.parse(fs.readFileSync(dbPath, "utf-8"));

console.log(`Loaded ${data.length} portfolios for initialization.`);

const mockDate = new Date().toISOString();

// Helper to generate a random number within a range
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const initialized = data.map((p) => {
  // If Nathishwar C, give perfect scores to guarantee Rank 1
  if (p.name === "Nathishwar C") {
    return {
      ...p,
      lighthouse: {
        performance: 100,
        accessibility: 100,
        bestPractices: 100,
        seo: 100,
        score: 100,
        updatedAt: mockDate,
      },
    };
  }

  // Generate mock metrics for others
  const perf = rand(45, 99);
  const acc = rand(55, 100);
  const bp = rand(60, 100);
  const seo = rand(65, 100);

  // Score = 40% Performance, 20% SEO, 20% Accessibility, 20% Best Practices
  const rawScore = (perf * 0.4) + (seo * 0.2) + (acc * 0.2) + (bp * 0.2);
  const score = parseFloat(rawScore.toFixed(1));

  return {
    ...p,
    lighthouse: {
      performance: perf,
      accessibility: acc,
      bestPractices: bp,
      seo: seo,
      score: score,
      updatedAt: mockDate,
    },
  };
});

// Sort by score DESC
initialized.sort((a, b) => b.lighthouse.score - a.lighthouse.score);

// Assign ranks 1..N
const ranked = initialized.map((p, idx) => {
  return {
    ...p,
    rank: idx + 1,
  };
});

// Write back to database
fs.writeFileSync(dbPath, JSON.stringify(ranked, null, 2), "utf-8");
console.log("Successfully initialized Lighthouse scores and updated rankings!");
