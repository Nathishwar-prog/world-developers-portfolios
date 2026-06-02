import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Sparkles, Github, X, SlidersHorizontal, Trophy } from "lucide-react";
import portfolios from "@/data/portfolios.json";
import { PortfolioCard, type Portfolio } from "@/components/PortfolioCard";
import {
  CATEGORIES,
  TECHNOLOGIES,
  categoryFor,
  technologiesFor,
  type Category,
  type Technology,
} from "@/lib/portfolio-taxonomy";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Portfolio Showcase — Discover Developer Portfolios" },
      {
        name: "description",
        content:
          "Browse a curated showcase of developer, designer, and engineer portfolios. Filter by category and technology.",
      },
      { property: "og:title", content: "Portfolio Showcase" },
      { property: "og:description", content: "A modern gallery of developer portfolios." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: Index,
});

const PAGE_SIZE = 36;
const data = portfolios as Portfolio[];

// Pre-compute taxonomy once at module load
const enriched = data.map((p) => ({
  p,
  category: categoryFor(p),
  techs: technologiesFor(p),
}));

function Index() {
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [category, setCategory] = useState<Category | "All">("All");
  const [selectedTechs, setSelectedTechs] = useState<Set<Technology>>(new Set());
  const [showAllTechs, setShowAllTechs] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return enriched.filter(({ p, category: c, techs }) => {
      if (category !== "All" && c !== category) return false;
      if (selectedTechs.size > 0 && !techs.some((t) => selectedTechs.has(t))) return false;
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
  }, [query, category, selectedTechs]);

  const shown = filtered.slice(0, visible);

  // Counts so filters feel alive
  const categoryCounts = useMemo(() => {
    const m = new Map<Category | "All", number>();
    m.set("All", enriched.length);
    for (const c of CATEGORIES) m.set(c, 0);
    for (const e of enriched) m.set(e.category, (m.get(e.category) ?? 0) + 1);
    return m;
  }, []);

  const techCounts = useMemo(() => {
    const m = new Map<Technology, number>();
    for (const t of TECHNOLOGIES) m.set(t, 0);
    for (const e of enriched) for (const t of e.techs) m.set(t, (m.get(t) ?? 0) + 1);
    return m;
  }, []);

  const toggleTech = (t: Technology) => {
    setSelectedTechs((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
    setVisible(PAGE_SIZE);
  };

  const resetFilters = () => {
    setCategory("All");
    setSelectedTechs(new Set());
    setQuery("");
    setVisible(PAGE_SIZE);
  };

  const activeFilterCount =
    (category !== "All" ? 1 : 0) + selectedTechs.size + (query.trim() ? 1 : 0);

  const visibleTechs = showAllTechs
    ? TECHNOLOGIES
    : TECHNOLOGIES.filter((t) => (techCounts.get(t) ?? 0) > 0).slice(0, 14);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-green to-brand-blue text-white shadow-lg">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="font-display text-base font-bold tracking-tight">Folio</p>
              <p className="text-[11px] text-muted-foreground">Portfolio Showcase</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/leaderboard"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-accent"
            >
              <Trophy className="h-4 w-4 text-amber-500" />
              <span className="hidden sm:inline">Leaderboard</span>
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-accent sm:flex"
            >
              <Github className="h-4 w-4" />
              Submit yours
            </a>
          </div>
        </div>
      </header>

      <section className="relative mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 sm:pt-24 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {data.length.toLocaleString()} portfolios indexed
            </span>
            <Link
              to="/leaderboard"
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600 transition-all hover:bg-amber-500/20"
            >
              <Trophy className="h-3.5 w-3.5 text-amber-500" />
              View Leaderboard & Rankings
            </Link>
          </div>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
            Discover portfolios from{" "}
            <span className="bg-gradient-to-r from-brand-green via-brand-blue to-brand-ink bg-clip-text text-transparent">
              builders worldwide
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-base text-muted-foreground sm:text-lg">
            A living gallery of developer, designer, and engineer portfolios. Filter by category
            and technology to find your next inspiration.
          </p>

          <div className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-full border border-border bg-card p-1.5 shadow-sm focus-within:ring-2 focus-within:ring-ring">
            <Search className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setVisible(PAGE_SIZE);
              }}
              placeholder="Search by name, role, or domain…"
              className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="mr-1 rounded-full px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-card/60 p-4 sm:p-5 backdrop-blur">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              <h2 className="font-display text-sm font-semibold tracking-tight">Filters</h2>
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-medium text-primary">
                  {activeFilterCount} active
                </span>
              )}
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <X className="h-3 w-3" /> Reset
              </button>
            )}
          </div>

          {/* Categories */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Category
            </p>
            <div className="flex flex-wrap gap-2">
              {(["All", ...CATEGORIES] as const).map((c) => {
                const active = category === c;
                const count = categoryCounts.get(c) ?? 0;
                const disabled = c !== "All" && count === 0;
                return (
                  <button
                    key={c}
                    disabled={disabled}
                    onClick={() => {
                      setCategory(c);
                      setVisible(PAGE_SIZE);
                    }}
                    className={
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all " +
                      (active
                        ? "border-transparent bg-gradient-to-r from-brand-green to-brand-blue text-white shadow-md shadow-brand-blue/20"
                        : disabled
                          ? "border-border bg-background/40 text-muted-foreground/50 cursor-not-allowed"
                          : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-accent")
                    }
                  >
                    {c}
                    <span
                      className={
                        "rounded-full px-1.5 py-0.5 text-[10px] " +
                        (active ? "bg-white/20 text-white" : "bg-muted text-muted-foreground")
                      }
                    >
                      {count.toLocaleString()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Technologies */}
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Technology
              </p>
              <button
                onClick={() => setShowAllTechs((v) => !v)}
                className="text-[11px] font-medium text-primary hover:underline"
              >
                {showAllTechs ? "Show less" : "Show all"}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {visibleTechs.map((t) => {
                const active = selectedTechs.has(t);
                const count = techCounts.get(t) ?? 0;
                const disabled = count === 0;
                return (
                  <button
                    key={t}
                    disabled={disabled}
                    onClick={() => toggleTech(t)}
                    className={
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all " +
                      (active
                        ? "border-primary bg-primary/10 text-primary"
                        : disabled
                          ? "border-border bg-background/40 text-muted-foreground/50 cursor-not-allowed"
                          : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-accent")
                    }
                  >
                    {t}
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      {count.toLocaleString()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Showing {Math.min(visible, filtered.length).toLocaleString()} of{" "}
          {filtered.length.toLocaleString()} results
        </p>
      </section>

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        {shown.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-16 text-center">
            <p className="font-display text-lg font-semibold">No portfolios match your filters</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try removing a filter or clearing your search.
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 inline-flex items-center gap-1 rounded-full border border-border bg-background px-4 py-2 text-xs font-medium text-foreground hover:bg-accent"
            >
              <X className="h-3 w-3" /> Reset all filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {shown.map(({ p }) => (
                <PortfolioCard key={p.url + p.name} p={p} />
              ))}
            </div>
            {visible < filtered.length && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  className="rounded-full bg-gradient-to-r from-brand-green to-brand-blue px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-blue/20 transition-transform hover:-translate-y-0.5"
                >
                  Load more portfolios
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-border/60 bg-background/60 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-muted-foreground sm:px-6 lg:px-8">
          Built with care. Previews via Microlink · {data.length.toLocaleString()} curated entries.
        </div>
      </footer>
    </div>
  );
}
