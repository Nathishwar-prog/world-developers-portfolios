import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Sparkles,
  Search,
  Globe,
  ArrowUpRight,
  Trophy,
  Crown,
  Medal,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  Gauge
} from "lucide-react";
import portfolios from "@/data/portfolios.json";
import { type Portfolio } from "@/components/PortfolioCard";
import { slugFor, categoryFor, technologiesFor, CATEGORIES, type Category } from "@/lib/portfolio-taxonomy";
import { getScreenshotUrl } from "@/lib/screenshot";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Design Leaderboard — Top Developer Portfolios" },
      {
        name: "description",
        content: "Discover the top-ranked developer and designer portfolios. View podium positions and complete leaderboards.",
      },
      { property: "og:title", content: "Design Leaderboard — Top Developer Portfolios" },
      { property: "og:description", content: "Discover the top-ranked developer and designer portfolios." },
    ],
  }),
  component: Leaderboard,
});

const data = portfolios as Portfolio[];
const PAGE_SIZE = 25;

function LighthouseMiniBadges({ lighthouse }: { lighthouse?: Portfolio["lighthouse"] }) {
  if (!lighthouse) return null;

  const categories = [
    { label: "Perf", score: lighthouse.performance },
    { label: "Acc", score: lighthouse.accessibility },
    { label: "Pract", score: lighthouse.bestPractices },
    { label: "SEO", score: lighthouse.seo },
  ];

  return (
    <div className="mt-3.5 flex items-center justify-center gap-2">
      {categories.map(({ label, score }) => {
        const colorClass =
          score >= 90
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
            : score >= 50
              ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
              : "bg-destructive/10 border-destructive/30 text-destructive";
        return (
          <div key={label} className="flex flex-col items-center gap-0.5">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold border ${colorClass}`}>
              {score}
            </div>
            <span className="text-[8px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

function Leaderboard() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "All">("All");
  const [page, setPage] = useState(0);

  // Retrieve top 3 portfolios based on rank
  const rank1 = useMemo(() => data.find((p) => p.rank === 1), []);
  const rank2 = useMemo(() => data.find((p) => p.rank === 2), []);
  const rank3 = useMemo(() => data.find((p) => p.rank === 3), []);

  // Filter remaining portfolios (ranks 4+) and sort by rank ascending
  const listItems = useMemo(() => {
    return data
      .filter((p) => p.rank !== undefined && p.rank > 3)
      .sort((a, b) => (a.rank ?? 9999) - (b.rank ?? 9999));
  }, []);

  // Filtered list based on search and category
  const filteredList = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listItems.filter((p) => {
      const pCategory = categoryFor(p);
      if (category !== "All" && pCategory !== category) return false;
      if (q) {
        const hay =
          p.name.toLowerCase() +
          " " +
          (p.tagline?.toLowerCase() ?? "") +
          " " +
          p.url.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [query, category, listItems]);

  const pageCount = Math.ceil(filteredList.length / PAGE_SIZE);
  const paginatedList = useMemo(() => {
    const start = page * PAGE_SIZE;
    return filteredList.slice(start, start + PAGE_SIZE);
  }, [filteredList, page]);

  const resetFilters = () => {
    setQuery("");
    setCategory("All");
    setPage(0);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < pageCount) {
      setPage(newPage);
      // Scroll list container into view smoothly
      const element = document.getElementById("leaderboard-list-section");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-green to-brand-blue text-white shadow-lg">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="font-display text-base font-bold tracking-tight">Folio</p>
              <p className="text-[11px] text-muted-foreground">Portfolio Showcase</p>
            </div>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-foreground transition-colors hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to gallery
          </Link>
        </div>
      </header>

      {/* Hero Header */}
      <section className="relative mx-auto max-w-7xl px-4 pb-6 pt-12 sm:px-6 lg:px-8 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600">
          <Trophy className="h-3.5 w-3.5 text-amber-500" />
          Aesthetics & Design Rankings
        </span>
        <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Portfolio{" "}
          <span className="bg-gradient-to-r from-amber-500 via-brand-green to-brand-blue bg-clip-text text-transparent">
            Leaderboard
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-balance text-sm sm:text-base text-muted-foreground">
          Explore the top developer portfolios ranked by layout design, tech stack complexity, aesthetics, and user experience.
        </p>
      </section>

      {/* Podium Section */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-stretch md:items-end justify-center gap-6 pt-12 md:pt-16 pb-8">
          
          {/* Second Place */}
          {rank2 && (
            <div className="order-2 md:order-1 flex-1 flex flex-col items-center">
              <div className="group relative w-full max-w-[280px] rounded-2xl border border-slate-300 bg-card p-5 text-center shadow-lg transition-transform duration-300 hover:-translate-y-1 flex flex-col justify-between min-h-[385px]">
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-slate-300 text-slate-900 border-4 border-background font-display font-extrabold shadow-md">
                  2nd
                </div>
                <div className="mt-4 flex flex-col items-center gap-3">
                  <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-slate-300 bg-brand-ink flex items-center justify-center shadow-lg">
                    <img
                      src="/silver_placeholder.png"
                      alt="Silver Trophy Placeholder"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <img
                      src={getScreenshotUrl(rank2.url, { width: 160, height: 160 })}
                      alt={rank2.name}
                      className="absolute inset-0 h-full w-full object-cover rounded-full opacity-0 transition-opacity duration-500"
                      onLoad={(e) => ((e.currentTarget as HTMLImageElement).style.opacity = "1")}
                    />
                  </div>
                  <div>
                    <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200">
                      {categoryFor(rank2)}
                    </span>
                    <h3 className="mt-1 font-display text-lg font-bold text-foreground line-clamp-1">{rank2.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1 px-2 h-8">{rank2.tagline ?? "Software Engineer"}</p>
                    <LighthouseMiniBadges lighthouse={rank2.lighthouse} />
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-1.5">
                  <Link
                    to="/portfolio/$slug"
                    params={{ slug: slugFor(rank2) }}
                    className="block w-full rounded-xl bg-slate-100 py-2 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-200"
                  >
                    View Details
                  </Link>
                  <a
                    href={rank2.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1 text-[11px] text-slate-500 hover:text-slate-700 py-1"
                  >
                    <Globe className="h-3.5 w-3.5" /> Visit Website
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* First Place */}
          {rank1 && (
            <div className="order-1 md:order-2 flex-1 flex flex-col items-center z-10">
              <div className="group relative w-full max-w-[300px] rounded-2xl border-2 border-amber-400 bg-card p-6 text-center shadow-xl transition-transform duration-300 hover:-translate-y-2 flex flex-col justify-between min-h-[425px] ring-4 ring-amber-400/10">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <Crown className="h-7 w-7 text-amber-500 animate-pulse mb-1" />
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 font-display font-black text-lg shadow-lg border-4 border-background">
                    1st
                  </div>
                </div>
                <div className="mt-6 flex flex-col items-center gap-3">
                  <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-amber-400 bg-brand-ink flex items-center justify-center shadow-lg">
                    <img
                      src="/gold_placeholder.png"
                      alt="Gold Trophy Placeholder"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <img
                      src={getScreenshotUrl(rank1.url, { width: 200, height: 200 })}
                      alt={rank1.name}
                      className="absolute inset-0 h-full w-full object-cover rounded-full opacity-0 transition-opacity duration-500"
                      onLoad={(e) => ((e.currentTarget as HTMLImageElement).style.opacity = "1")}
                    />
                  </div>
                  <div>
                    <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">
                      {categoryFor(rank1)}
                    </span>
                    <h3 className="mt-1 font-display text-xl font-extrabold text-foreground line-clamp-1">{rank1.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1 px-2 h-8">{rank1.tagline ?? "AI & ML Engineer"}</p>
                    <LighthouseMiniBadges lighthouse={rank1.lighthouse} />
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-1.5">
                  <Link
                    to="/portfolio/$slug"
                    params={{ slug: slugFor(rank1) }}
                    className="block w-full rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-2.5 text-xs font-bold text-amber-950 shadow-md transition-all hover:brightness-105"
                  >
                    View Details
                  </Link>
                  <a
                    href={rank1.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1 text-[11px] text-amber-600 font-medium hover:text-amber-800 py-1"
                  >
                    <Globe className="h-3.5 w-3.5" /> Visit Website
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Third Place */}
          {rank3 && (
            <div className="order-3 flex-1 flex flex-col items-center">
              <div className="group relative w-full max-w-[280px] rounded-2xl border border-amber-700/60 bg-card p-5 text-center shadow-lg transition-transform duration-300 hover:-translate-y-1 flex flex-col justify-between min-h-[365px]">
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-700 text-amber-50 border-4 border-background font-display font-extrabold shadow-md">
                  3rd
                </div>
                <div className="mt-4 flex flex-col items-center gap-3">
                  <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-amber-700/60 bg-brand-ink flex items-center justify-center shadow-lg">
                    <img
                      src="/bronze_placeholder.png"
                      alt="Bronze Trophy Placeholder"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <img
                      src={getScreenshotUrl(rank3.url, { width: 160, height: 160 })}
                      alt={rank3.name}
                      className="absolute inset-0 h-full w-full object-cover rounded-full opacity-0 transition-opacity duration-500"
                      onLoad={(e) => ((e.currentTarget as HTMLImageElement).style.opacity = "1")}
                    />
                  </div>
                  <div>
                    <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800 border border-amber-700/20">
                      {categoryFor(rank3)}
                    </span>
                    <h3 className="mt-1 font-display text-lg font-bold text-foreground line-clamp-1">{rank3.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1 px-2 h-8">{rank3.tagline ?? "Web Developer"}</p>
                    <LighthouseMiniBadges lighthouse={rank3.lighthouse} />
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-1.5">
                  <Link
                    to="/portfolio/$slug"
                    params={{ slug: slugFor(rank3) }}
                    className="block w-full rounded-xl bg-amber-50/50 border border-amber-700/25 py-2 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-100/50"
                  >
                    View Details
                  </Link>
                  <a
                    href={rank3.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1 text-[11px] text-amber-800 hover:text-amber-950 py-1"
                  >
                    <Globe className="h-3.5 w-3.5" /> Visit Website
                  </a>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Leaderboard List Section */}
      <section id="leaderboard-list-section" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="rounded-2xl border border-border bg-card/60 p-4 sm:p-6 backdrop-blur">
          
          {/* Filters Bar */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-6 border-b border-border/60">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              <h2 className="font-display text-lg font-bold tracking-tight">All Rankings</h2>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2.5">
              {/* Search */}
              <div className="relative flex items-center rounded-full border border-border bg-background px-3 py-1.5 focus-within:ring-2 focus-within:ring-ring">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(0);
                  }}
                  placeholder="Search ranking list..."
                  className="bg-transparent pl-2 text-xs outline-none w-44 placeholder:text-muted-foreground"
                />
              </div>

              {/* Category Dropdown */}
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as Category | "All");
                  setPage(0);
                }}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {(query || category !== "All") && (
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3.5 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  <X className="h-3 w-3" /> Clear
                </button>
              )}
            </div>
          </div>

          {/* Table / List */}
          <div className="mt-6 overflow-hidden">
            {filteredList.length === 0 ? (
              <div className="py-12 text-center">
                <p className="font-display text-base font-semibold">No portfolios found</p>
                <p className="text-xs text-muted-foreground mt-1">Try resetting your filters or modifying your search query.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {paginatedList.map((p) => {
                  const pCategory = categoryFor(p);
                  const pTechs = technologiesFor(p);
                  const initials = p.name
                    .split(" ")
                    .map((s) => s[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();
                  const pSlug = slugFor(p);

                  return (
                    <div
                      key={p.url + p.name}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:bg-accent/40"
                    >
                      <div className="flex items-center gap-4">
                        {/* Rank Badge */}
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted font-display text-sm font-bold text-muted-foreground border border-border">
                          #{p.rank}
                        </div>

                        {/* Screenshot Thumbnail */}
                        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded bg-gradient-to-br from-brand-green/20 to-brand-blue/20 border border-border">
                          <img
                            src={getScreenshotUrl(p.url, { width: 160, height: 120 })}
                            alt={p.name}
                            loading="lazy"
                            className="absolute inset-0 h-full w-full object-cover object-top opacity-0 transition-opacity duration-300"
                            onLoad={(e) => ((e.currentTarget as HTMLImageElement).style.opacity = "1")}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                            <span className="text-[10px] font-bold text-muted-foreground/60">{initials}</span>
                          </div>
                        </div>

                        {/* Title & Tagline */}
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <h4 className="font-display font-semibold text-sm text-foreground line-clamp-1">{p.name}</h4>
                            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                              {pCategory}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 pr-2">
                            {p.tagline ?? new URL(p.url).hostname}
                          </p>
                        </div>
                      </div>

                      {/* Tech stack & Action Buttons */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-border/40">
                        {/* Lighthouse Score badge */}
                        {p.lighthouse && (
                          <div
                            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border transition-transform ${
                              p.lighthouse.score >= 90
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : p.lighthouse.score >= 50
                                  ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                  : "bg-destructive/10 text-destructive border-destructive/20"
                            }`}
                          >
                            <Gauge className="h-3.5 w-3.5" />
                            <span>Score: {p.lighthouse.score}</span>
                          </div>
                        )}

                        {/* Tech tags - hidden on small screens */}
                        <div className="hidden lg:flex flex-wrap gap-1 max-w-[200px]">
                          {pTechs.slice(0, 2).map((t) => (
                            <span key={t} className="rounded bg-muted/60 px-1 py-0.5 text-[9px] text-muted-foreground border border-border/40">
                              {t}
                            </span>
                          ))}
                          {pTechs.length > 2 && (
                            <span className="text-[9px] text-muted-foreground px-1 py-0.5">+{pTechs.length - 2}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          <Link
                            to="/portfolio/$slug"
                            params={{ slug: pSlug }}
                            className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent transition-colors shrink-0"
                          >
                            Details
                          </Link>
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-br from-brand-green to-brand-blue px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:brightness-105 transition-all shrink-0"
                          >
                            Visit <ArrowUpRight className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {pageCount > 1 && (
            <div className="mt-8 flex items-center justify-between border-t border-border/60 pt-4 text-xs text-muted-foreground">
              <p>
                Showing {page * PAGE_SIZE + 1} - {Math.min((page + 1) * PAGE_SIZE, filteredList.length)} of {filteredList.length} ranked
              </p>
              
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => handlePageChange(page - 1)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="font-medium text-foreground">
                  Page {page + 1} of {pageCount}
                </span>
                <button
                  disabled={page === pageCount - 1}
                  onClick={() => handlePageChange(page + 1)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-background/60 py-8 mt-12">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-muted-foreground sm:px-6 lg:px-8">
          Built with care. Previews via Microlink · {data.length.toLocaleString()} ranked entries.
        </div>
      </footer>
    </div>
  );
}
