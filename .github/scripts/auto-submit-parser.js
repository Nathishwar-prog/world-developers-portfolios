import fs from "fs";
import path from "path";

function parseIssueBody(body) {
  const fields = {};
  if (!body) return fields;

  const sections = body.split(/###\s+/);
  for (const section of sections) {
    if (!section.trim()) continue;
    const lines = section.trim().split("\n");
    const header = lines[0].trim().toLowerCase();
    const content = lines.slice(1).join("\n").trim();

    if (header.includes("name")) {
      fields.name = content;
    } else if (header.includes("url")) {
      // Clean up URL formatting (some users might add markdown link tags or brackets)
      let cleanUrl = content.replace(/[<>[\]()]/g, "").trim();
      if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
        cleanUrl = "https://" + cleanUrl;
      }
      fields.url = cleanUrl;
    } else if (header.includes("tagline")) {
      fields.tagline = content;
    } else if (header.includes("technologies")) {
      fields.technologies = content;
    }
  }
  return fields;
}

async function validateUrlAccessible(url) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return res.status >= 200 && res.status < 400;
  } catch (err) {
    return false;
  }
}

function writeOutput(variables) {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (outputPath) {
    let outputString = "";
    for (const [key, value] of Object.entries(variables)) {
      outputString += `${key}=${value}\n`;
    }
    fs.appendFileSync(outputPath, outputString, "utf-8");
  }
}

async function run() {
  const issueBody = process.env.ISSUE_BODY || "";
  const issueNumber = process.env.ISSUE_NUMBER || "0";

  console.log(`[Auto Submit] Starting verification for issue #${issueNumber}`);

  const fields = parseIssueBody(issueBody);
  console.log("[Auto Submit] Parsed fields:", fields);

  const errors = [];
  if (!fields.name) errors.push("Missing 'Full Name' field.");
  if (!fields.url) errors.push("Missing 'Portfolio URL' field.");
  if (!fields.tagline) errors.push("Missing 'Tagline' field.");

  if (errors.length > 0) {
    const errorMsg = errors.join("\\n");
    console.error(`[Auto Submit] Validation failed: ${errorMsg}`);
    writeOutput({ status: "failure", error_message: errorMsg });
    process.exit(1);
  }

  // 1. URL format validation
  let urlObj;
  try {
    urlObj = new URL(fields.url);
  } catch (err) {
    const errorMsg = `The URL '${fields.url}' is not formatted correctly.`;
    console.error(`[Auto Submit] Validation failed: ${errorMsg}`);
    writeOutput({ status: "failure", error_message: errorMsg });
    process.exit(1);
  }

  // 2. Prevent duplication check
  const dbPath = path.resolve(process.cwd(), "src/data/portfolios.json");
  if (!fs.existsSync(dbPath)) {
    const errorMsg = "Database file portfolios.json not found.";
    console.error(`[Auto Submit] Validation failed: ${errorMsg}`);
    writeOutput({ status: "failure", error_message: errorMsg });
    process.exit(1);
  }

  const fileContent = fs.readFileSync(dbPath, "utf-8");
  const portfolios = JSON.parse(fileContent);

  const duplicate = portfolios.find(
    (p) =>
      p.url.replace(/\/$/, "").toLowerCase() ===
      fields.url.replace(/\/$/, "").toLowerCase()
  );

  if (duplicate) {
    const errorMsg = `This portfolio URL (${fields.url}) is already registered in our showcase (currently Rank #${duplicate.rank}).`;
    console.error(`[Auto Submit] Duplication error: ${errorMsg}`);
    writeOutput({ status: "failure", error_message: errorMsg });
    process.exit(1);
  }

  // 3. Live accessibility verification
  console.log(`[Auto Submit] Verifying live connection to: ${fields.url}`);
  const isLive = await validateUrlAccessible(fields.url);
  if (!isLive) {
    const errorMsg = `Could not reach ${fields.url}. Please ensure the site is active, publicly accessible, and returns a successful HTTP status code (200-399).`;
    console.error(`[Auto Submit] Connection failed: ${errorMsg}`);
    writeOutput({ status: "failure", error_message: errorMsg });
    process.exit(1);
  }

  // 4. Format tagline to include technologies if provided
  let tagline = fields.tagline;
  if (fields.technologies) {
    const techs = fields.technologies
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    if (techs.length > 0) {
      // Append matching tech items to tagline so regex-based technologiesFor matching picks them up automatically
      tagline += ` — ${techs.join(", ")}`;
    }
  }

  // 5. Append to database with baseline metrics and updatedAt: 0 (instantly queued for audit)
  const newPortfolio = {
    name: fields.name.trim(),
    url: fields.url.trim(),
    tagline: tagline.trim(),
    lighthouse: {
      performance: 50,
      accessibility: 50,
      bestPractices: 50,
      seo: 50,
      score: 50,
      updatedAt: new Date(0).toISOString(), // setting to epoch zero priority
    },
  };

  portfolios.push(newPortfolio);

  // 6. Sort descending by score
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

  // Write updated database back to file
  fs.writeFileSync(dbPath, JSON.stringify(ranked, null, 2), "utf-8");

  // Retrieve the assigned rank
  const finalItem = ranked.find(
    (p) => p.url.toLowerCase() === fields.url.toLowerCase()
  );
  const finalRank = finalItem ? finalItem.rank : ranked.length;

  console.log(`[Auto Submit] Verification successful! Saved at Rank #${finalRank}`);

  writeOutput({
    status: "success",
    rank: finalRank,
    name: fields.name.trim(),
    url: fields.url.trim(),
  });
}

run();
