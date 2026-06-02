import { ArrowUpRight, Globe } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { slugFor } from "@/lib/portfolio-taxonomy";


export interface Portfolio {
  name: string;
  url: string;
  tagline?: string;
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
  const screenshot = `https://image.thum.io/get/width/640/crop/420/noanimate/${p.url}`;

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
        <img
          src={screenshot}
          alt={`${p.name} portfolio preview`}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover object-top opacity-0 transition-opacity duration-500"
          onLoad={(e) => ((e.currentTarget as HTMLImageElement).style.opacity = "1")}
          onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-5xl font-bold text-white/90 mix-blend-overlay">
            {initials}
          </span>
        </div>
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
    </a>
  );
}
