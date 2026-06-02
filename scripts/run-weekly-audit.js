import fs from "fs";
import path from "path";

const dbPath = path.resolve(process.cwd(), "src/data/portfolios.json");

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runAuditForPortfolio(url) {
  const cleanUrl = url.trim();
  const categories = ["PERFORMANCE", "ACCESSIBILITY", "BEST_PRACTICES", "SEO"];
  const categoryQuery = categories.map((c) => `category=${c}`).join("&");
  let apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(cleanUrl)}&${categoryQuery}`;
  
  if (process.env.PAGESPEED_API_KEY) {
    apiUrl += `&key=${process.env.PAGESPEED_API_KEY}`;
  }

  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`Google PageSpeed API returned HTTP ${response.status}`);
  }

  const json = await response.json();
  const result = json.lighthouseResult;

  if (!result || !result.categories) {
    throw new Error("Invalid or incomplete response from PageSpeed API.");
  }

  const performance = Math.round((result.categories.performance?.score ?? 0.5) * 100);
  const accessibility = Math.round((result.categories.accessibility?.score ?? 0.5) * 100);
  const bestPractices = Math.round((result.categories["best-practices"]?.score ?? 0.5) * 100);
  const seo = Math.round((result.categories.seo?.score ?? 0.5) * 100);

  const rawScore = (performance * 0.4) + (seo * 0.2) + (accessibility * 0.2) + (bestPractices * 0.2);
  const score = parseFloat(rawScore.toFixed(1));

  return { performance, accessibility, bestPractices, seo, score };
}

async function main() {
  if (!fs.existsSync(dbPath)) {
    console.error("Database portfolios.json not found.");
    process.exit(1);
  }

  const fileContent = fs.readFileSync(dbPath, "utf-8");
  const portfolios = JSON.parse(fileContent);

  console.log(`[Weekly Audit] Starting audits for ${portfolios.length} portfolios...`);

  const apiKey = process.env.PAGESPEED_API_KEY;
  const delay = apiKey ? 500 : 2000;

  for (let i = 0; i < portfolios.length; i++) {
    const p = portfolios[i];
    console.log(`[${i + 1}/${portfolios.length}] Auditing: ${p.name} (${p.url})`);
    
    try {
      const metrics = await runAuditForPortfolio(p.url);
      p.lighthouse = {
        ...metrics,
        updatedAt: new Date().toISOString(),
      };
      console.log(` -> Success! Score: ${metrics.score}`);
    } catch (err) {
      console.warn(` -> Failed: ${err.message}`);
    }

    await sleep(delay);
  }

  // Sort DESC by score
  portfolios.sort((a, b) => {
    const scoreA = a.lighthouse?.score ?? 0;
    const scoreB = b.lighthouse?.score ?? 0;
    return scoreB - scoreA;
  });

  // Re-assign ranks
  const ranked = portfolios.map((p, idx) => ({
    ...p,
    rank: idx + 1,
  }));

  fs.writeFileSync(dbPath, JSON.stringify(ranked, null, 2), "utf-8");
  console.log("[Weekly Audit] Complete! Database updated.");
}

main();
