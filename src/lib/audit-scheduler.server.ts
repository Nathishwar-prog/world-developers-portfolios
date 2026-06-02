import fs from "fs";
import path from "path";

// 1 audit every 60 seconds is 1440 audits per day, which is perfectly safe for Google's keyless API.
const AUDIT_INTERVAL_MS = 60 * 1000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function startAuditScheduler() {
  if ((globalThis as any).__auditSchedulerRunning) return;
  (globalThis as any).__auditSchedulerRunning = true;
  console.log("[Audit Scheduler] Background weekly audit scheduler initialized.");
  
  // Run the first check in 10 seconds to let the server start up smoothly
  setTimeout(runNextSchedulerTick, 10000);
}

async function runNextSchedulerTick() {
  try {
    const dbPath = path.resolve(process.cwd(), "src/data/portfolios.json");
    if (!fs.existsSync(dbPath)) {
      setTimeout(runNextSchedulerTick, AUDIT_INTERVAL_MS);
      return;
    }

    const fileContent = fs.readFileSync(dbPath, "utf-8");
    const portfolios = JSON.parse(fileContent);

    const now = Date.now();
    let targetIndex = -1;
    let oldestTime = now;

    for (let i = 0; i < portfolios.length; i++) {
      const p = portfolios[i];
      const updatedAt = p.lighthouse?.updatedAt ? new Date(p.lighthouse.updatedAt).getTime() : 0;
      
      // If never updated, take absolute priority
      if (updatedAt === 0) {
        targetIndex = i;
        break;
      }
      
      // Select the oldest updated portfolio that is older than 7 days
      if (now - updatedAt >= SEVEN_DAYS_MS && updatedAt < oldestTime) {
        oldestTime = updatedAt;
        targetIndex = i;
      }
    }

    if (targetIndex !== -1) {
      const target = portfolios[targetIndex];
      console.log(`[Audit Scheduler] Automatically auditing oldest portfolio: ${target.name} (${target.url})`);
      await runAuditForPortfolio(target.url);
    }
  } catch (err: any) {
    console.error("[Audit Scheduler] Error in scheduler tick:", err.message);
  } finally {
    // Re-schedule the next tick
    setTimeout(runNextSchedulerTick, AUDIT_INTERVAL_MS);
  }
}

async function runAuditForPortfolio(url: string) {
  try {
    const cleanUrl = url.trim();
    const categories = ["PERFORMANCE", "ACCESSIBILITY", "BEST_PRACTICES", "SEO"];
    const categoryQuery = categories.map((c) => `category=${c}`).join("&");
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(cleanUrl)}&${categoryQuery}`;

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

    const dbPath = path.resolve(process.cwd(), "src/data/portfolios.json");
    if (!fs.existsSync(dbPath)) return;

    const fileContent = fs.readFileSync(dbPath, "utf-8");
    const portfolios = JSON.parse(fileContent);

    const itemIdx = portfolios.findIndex((p: any) => p.url === cleanUrl);
    if (itemIdx === -1) return;

    // Update item
    portfolios[itemIdx].lighthouse = {
      performance,
      accessibility,
      bestPractices,
      seo,
      score,
      updatedAt: new Date().toISOString(),
    };

    // Sort DESC by score
    portfolios.sort((a: any, b: any) => {
      const scoreA = a.lighthouse?.score ?? 0;
      const scoreB = b.lighthouse?.score ?? 0;
      return scoreB - scoreA;
    });

    // Re-assign ranks
    const ranked = portfolios.map((p: any, idx: number) => ({
      ...p,
      rank: idx + 1,
    }));

    fs.writeFileSync(dbPath, JSON.stringify(ranked, null, 2), "utf-8");
    console.log(`[Audit Scheduler] Auto-audit successful for ${cleanUrl}. New Score: ${score}`);
  } catch (err: any) {
    console.warn(`[Audit Scheduler] Auto-audit failed for ${url}:`, err.message);
    
    // On failure (429 rate limit or server issue), update the updatedAt timestamp to "now"
    // to prevent it clogging the queue immediately. It will be retried in the next 7-day cycle.
    try {
      const dbPath = path.resolve(process.cwd(), "src/data/portfolios.json");
      if (fs.existsSync(dbPath)) {
        const fileContent = fs.readFileSync(dbPath, "utf-8");
        const portfolios = JSON.parse(fileContent);
        const itemIdx = portfolios.findIndex((p: any) => p.url === url);
        if (itemIdx !== -1) {
          if (!portfolios[itemIdx].lighthouse) {
            portfolios[itemIdx].lighthouse = {
              performance: 50,
              accessibility: 50,
              bestPractices: 50,
              seo: 50,
              score: 50,
              updatedAt: new Date().toISOString(),
            };
          } else {
            portfolios[itemIdx].lighthouse.updatedAt = new Date().toISOString();
          }
          fs.writeFileSync(dbPath, JSON.stringify(portfolios, null, 2), "utf-8");
        }
      }
    } catch (touchErr) {
      // noop
    }
  }
}
