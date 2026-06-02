import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import fs from "fs";
import path from "path";

export interface AuditResult {
  success: boolean;
  lighthouse: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    score: number;
    updatedAt: string;
  };
  rank: number;
}

export const auditPortfolioServerFn = createServerFn({ method: "POST" })
  .inputValidator(z.string())
  .handler(async ({ data: url }): Promise<AuditResult> => {
    try {
      const cleanUrl = url.trim();
      console.log(`[Audit Server] Triggering PageSpeed audit for: ${cleanUrl}`);

      // Query keyless public Google PageSpeed Insights API
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

      // Convert scores (0.0 to 1.0) to percentage scale (0 to 100)
      const performance = Math.round((result.categories.performance?.score ?? 0.5) * 100);
      const accessibility = Math.round((result.categories.accessibility?.score ?? 0.5) * 100);
      const bestPractices = Math.round((result.categories["best-practices"]?.score ?? 0.5) * 100);
      const seo = Math.round((result.categories.seo?.score ?? 0.5) * 100);

      // Score = 40% Performance, 20% SEO, 20% Accessibility, 20% Best Practices
      const rawScore = (performance * 0.4) + (seo * 0.2) + (accessibility * 0.2) + (bestPractices * 0.2);
      const score = parseFloat(rawScore.toFixed(1));

      // Resolve portfolios path
      const dbPath = path.resolve(process.cwd(), "src/data/portfolios.json");
      if (!fs.existsSync(dbPath)) {
        throw new Error("Portfolios database file not found.");
      }

      const fileContent = fs.readFileSync(dbPath, "utf-8");
      const portfolios = JSON.parse(fileContent);

      const itemIdx = portfolios.findIndex((p: any) => p.url === cleanUrl);
      if (itemIdx === -1) {
        throw new Error("Portfolio URL not found in database.");
      }

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
      const ranked = portfolios.map((p: any, idx: number) => {
        return {
          ...p,
          rank: idx + 1,
        };
      });

      // Write back to database
      fs.writeFileSync(dbPath, JSON.stringify(ranked, null, 2), "utf-8");
      
      // Retrieve the updated item (since sorting changed index)
      const updatedItem = ranked.find((p: any) => p.url === cleanUrl);

      console.log(`[Audit Server] Audit successful. New Rank: #${updatedItem.rank}, Overall Score: ${updatedItem.lighthouse.score}`);

      return {
        success: true,
        lighthouse: updatedItem.lighthouse,
        rank: updatedItem.rank,
      };
    } catch (err: any) {
      console.error("[Audit Server] Audit failed:", err.message);
      throw new Error(err.message || "Failed to process Lighthouse audit.");
    }
  });
