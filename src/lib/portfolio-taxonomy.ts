import type { Portfolio } from "@/components/PortfolioCard";

export const CATEGORIES = [
  "Frontend",
  "Backend",
  "Full Stack",
  "Mobile",
  "Design / UX",
  "AI / ML",
  "Data",
  "DevOps / Cloud",
  "Product / PM",
  "Game Dev",
  "Other",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const TECHNOLOGIES = [
  "React",
  "Next.js",
  "Vue",
  "Angular",
  "Svelte",
  "Astro",
  "Node.js",
  "Python",
  "Django",
  "Rails",
  "Java",
  ".NET",
  "Go",
  "Rust",
  "PHP",
  "Laravel",
  "Flutter",
  "React Native",
  "iOS / Swift",
  "Android / Kotlin",
  "Salesforce",
  "AWS",
  "GCP",
  "Azure",
  "Framer",
  "Webflow",
  "Vercel",
  "Netlify",
  "GitHub Pages",
] as const;
export type Technology = (typeof TECHNOLOGIES)[number];

function host(url: string) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

export function categoryFor(p: Portfolio): Category {
  const t = (p.tagline ?? "").toLowerCase();
  if (!t) return "Other";
  const has = (...k: string[]) => k.some((x) => t.includes(x));

  if (has("product manager", "product owner", " pm", "pm |", "pm,", "program manager")) return "Product / PM";
  if (has("game", "unity", "unreal")) return "Game Dev";
  if (has("devops", "sre", "cloud engineer", "platform engineer", "kubernetes", "infrastructure")) return "DevOps / Cloud";
  if (has("data scientist", "data analyst", "data engineer", "analytics", "bi ", "business intelligence")) return "Data";
  if (has("ai ", "ml ", "machine learning", "deep learning", "nlp", "llm", "genai", "ai/ml", "ai engineer", "ml engineer")) return "AI / ML";
  if (has("ux", "ui ", "ui/", "designer", "design ", "design,", "product design", "visual", "brand", "graphic")) return "Design / UX";
  if (has("ios", "android", "mobile", "flutter", "react native", "swift", "kotlin")) return "Mobile";
  if (has("full stack", "full-stack", "fullstack")) return "Full Stack";
  if (has("backend", "back-end", "back end", "server", "api", "django", "rails", "spring", ".net", "node")) return "Backend";
  if (has("frontend", "front-end", "front end", "web developer", "react", "vue", "angular", "svelte", "next")) return "Frontend";
  if (has("engineer", "developer", "programmer", "software")) return "Full Stack";
  return "Other";
}

export function technologiesFor(p: Portfolio): Technology[] {
  const t = (p.tagline ?? "").toLowerCase();
  const h = host(p.url);
  const set = new Set<Technology>();

  const tagMap: Array<[Technology, RegExp]> = [
    ["React", /\breact(?!\s*native)\b/],
    ["Next.js", /\bnext(\.js)?\b/],
    ["Vue", /\bvue(\.js)?\b/],
    ["Angular", /\bangular\b/],
    ["Svelte", /\bsvelte(kit)?\b/],
    ["Astro", /\bastro\b/],
    ["Node.js", /\bnode(\.js)?\b/],
    ["Python", /\bpython\b/],
    ["Django", /\bdjango\b/],
    ["Rails", /\b(ruby on )?rails\b/],
    ["Java", /\bjava\b(?!script)/],
    [".NET", /\.net|c#|asp\.net/],
    ["Go", /\b(golang|go developer|go engineer)\b/],
    ["Rust", /\brust\b/],
    ["PHP", /\bphp\b/],
    ["Laravel", /\blaravel\b/],
    ["Flutter", /\bflutter\b/],
    ["React Native", /\breact native\b/],
    ["iOS / Swift", /\b(ios|swift)\b/],
    ["Android / Kotlin", /\b(android|kotlin)\b/],
    ["Salesforce", /\bsalesforce\b/],
    ["AWS", /\baws\b/],
    ["GCP", /\bgcp|google cloud\b/],
    ["Azure", /\bazure\b/],
  ];
  for (const [tech, rx] of tagMap) if (rx.test(t)) set.add(tech);

  if (h.includes("framer.website") || h.includes("framer.app")) set.add("Framer");
  if (h.includes("webflow.io")) set.add("Webflow");
  if (h.endsWith(".vercel.app")) set.add("Vercel");
  if (h.endsWith(".netlify.app")) set.add("Netlify");
  if (h.endsWith(".github.io")) set.add("GitHub Pages");

  return Array.from(set);
}
