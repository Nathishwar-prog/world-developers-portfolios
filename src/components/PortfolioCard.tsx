import { ArrowUpRight, Globe, Gauge } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { slugFor } from "@/lib/portfolio-taxonomy";
import { getScreenshotUrl } from "@/lib/screenshot";


export interface Portfolio {
  name: string;
  url: string;
  tagline?: string;
  rank?: number;
  lighthouse?: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    score: number;
    updatedAt: string;
  };
}

function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function gradientFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const palettes = [
    "from-[oklch(0.66_0.18_152)] to-[oklch(0.55_0.18_245)]",
    "from-[oklch(0.55_0.18_245)] to-[oklch(0.16_0.02_240)]",
    "from-[oklch(0.72_0.16_180)] to-[oklch(0.66_0.18_152)]",
    "from-[oklch(0.16_0.02_240)] to-[oklch(0.55_0.18_245)]",
    "from-[oklch(0.66_0.18_152)] to-[oklch(0.16_0.02_240)]",
  ];
  return palettes[h % palettes.length];
}

export function PortfolioCard({ p }: { p: Portfolio }) {
  const initials = p.name
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const grad = gradientFor(p.name);
  const host = hostname(p.url);
  const screenshot = getScreenshotUrl(p.url, { width: 800, height: 600 });

  return (
    <Link
      to="/portfolio/$slug"
      params={{ slug: slugFor(p) }}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-card border border-border transition-all duration-300 hover:-translate-y-1"
      style={{ boxShadow: "var(--shadow-card)" }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-card-hover)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-card)")}
    >
      <div className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${grad}`}>
        {/* Mock Website Layout Preview shown while loading or as fallback */}
        <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-40 mix-blend-overlay">
          {/* Mock Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-white" />
              <div className="h-1 w-8 rounded bg-white/60" />
            </div>
            <div className="flex items-center gap-1">
              <div className="h-1 w-4 rounded bg-white/40" />
              <div className="h-1 w-4 rounded bg-white/40" />
            </div>
          </div>
          {/* Mock Hero Content */}
          <div className="my-auto flex flex-col items-center gap-1.5 text-center">
            <div className="h-2 w-20 rounded bg-white/80" />
            <div className="h-1 w-24 rounded bg-white/50" />
            <div className="mt-1 h-3.5 w-10 rounded-full bg-white/60" />
          </div>
          {/* Mock Footer Row */}
          <div className="flex items-center justify-between border-t border-white/10 pt-1.5 text-[7px] text-white/50 font-mono">
            <span>Portfolio</span>
            <span>Est. 2026</span>
          </div>
        </div>

        {/* Centered initials in a glossy glass circular emblem */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-lg backdrop-blur-md transition-transform duration-300 group-hover:scale-105">
            <span className="font-display text-xl font-bold text-white tracking-wider">
              {initials}
            </span>
          </div>
        </div>

        <img
          src={screenshot}
          alt={`${p.name} portfolio preview`}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover object-top opacity-0 transition-opacity duration-500"
          onLoad={(e) => ((e.currentTarget as HTMLImageElement).style.opacity = "1")}
          onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
        />
        
        {/* Rank Badge */}
        {p.rank && (
          <div
            className={`absolute top-3 left-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold shadow-md backdrop-blur-md border ${
              p.rank === 1
                ? "bg-amber-400/90 text-amber-950 border-amber-300/50"
                : p.rank === 2
                  ? "bg-slate-200/90 text-slate-900 border-slate-100/50"
                  : p.rank === 3
                    ? "bg-amber-700/90 text-amber-50 border-amber-600/50"
                    : "bg-black/50 text-white border-white/10"
            }`}
          >
            <span>
              {p.rank === 1 ? "🥇 #1" : p.rank === 2 ? "🥈 #2" : p.rank === 3 ? "🥉 #3" : `#${p.rank}`}
            </span>
          </div>
        )}

        {/* Lighthouse Score Badge */}
        {p.lighthouse && (
          <div
            className={`absolute bottom-3 left-3 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold shadow-md backdrop-blur-md border transition-transform group-hover:scale-105 ${
              p.lighthouse.score >= 90
                ? "bg-emerald-500/90 text-white border-emerald-400/40"
                : p.lighthouse.score >= 50
                  ? "bg-amber-500/90 text-white border-amber-400/40"
                  : "bg-destructive/90 text-white border-destructive/40"
            }`}
          >
            <Gauge className="h-3.5 w-3.5" />
            <span>Score: {p.lighthouse.score}</span>
          </div>
        )}

        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-xs text-white backdrop-blur-md">
          <Globe className="h-3 w-3" />
          <span className="max-w-[140px] truncate">{host}</span>
        </div>
        <div className="absolute bottom-3 right-3 rounded-full bg-white p-2 text-brand-ink translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>
      <div className="flex flex-col gap-1 p-4">
        <h3 className="font-display text-base font-semibold tracking-tight text-foreground truncate">
          {p.name}
        </h3>
        {p.tagline ? (
          <p className="text-sm text-muted-foreground line-clamp-1">{p.tagline}</p>
        ) : (
          <p className="text-sm text-primary/80 truncate">{host}</p>
        )}
      </div>
    </Link>
  );
}
