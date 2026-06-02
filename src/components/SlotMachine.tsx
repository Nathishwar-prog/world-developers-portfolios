import { useState, useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Dices, X, Volume2, VolumeX, Sparkles, Globe, ArrowRight } from "lucide-react";
import portfolios from "@/data/portfolios.json";
import { type Portfolio } from "@/components/PortfolioCard";
import { slugFor, categoryFor } from "@/lib/portfolio-taxonomy";

const data = portfolios as Portfolio[];

// Synthesize arcade tick sound
const playTickSound = (isMuted: boolean) => {
  if (isMuted) return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.015, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (err) {
    // Ignore context blocked errors
  }
};

// Synthesize retro victory sound
const playWinSound = (isMuted: boolean) => {
  if (isMuted) return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      
      gain.gain.setValueAtTime(0.02, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
      
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    // Play a happy major arpeggio (C5 -> E5 -> G5)
    playTone(523.25, 0, 0.15);
    playTone(659.25, 0.12, 0.15);
    playTone(783.99, 0.24, 0.35);
  } catch (err) {
    // Ignore context blocked errors
  }
};

export function SlotMachine() {
  const [isOpen, setIsOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [hasWon, setHasWon] = useState(false);
  const [muted, setMuted] = useState(false);
  const navigate = useNavigate();

  // Load volume preference on mount
  useEffect(() => {
    const savedMuted = localStorage.getItem("slot-machine-muted");
    if (savedMuted !== null) {
      setMuted(savedMuted === "true");
    }
  }, []);

  const toggleMute = () => {
    setMuted((prev) => {
      const next = !prev;
      localStorage.setItem("slot-machine-muted", String(next));
      return next;
    });
  };

  const startSpin = () => {
    if (spinning || data.length === 0) return;
    setSpinning(true);
    setHasWon(false);
    
    let currentDelay = 40; // Starts fast (40ms)
    const maxDelay = 450;  // Slows down to (450ms)
    const duration = 2000; // 2 seconds total spin
    const startTime = Date.now();
    
    const tick = () => {
      const randomIdx = Math.floor(Math.random() * data.length);
      setSelectedIdx(randomIdx);
      playTickSound(muted);
      
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;
      
      if (progress < 1.0) {
        // Slow down exponentially (e.g. y = x^2.5)
        currentDelay = 40 + Math.pow(progress, 2.5) * (maxDelay - 40);
        setTimeout(tick, currentDelay);
      } else {
        setSpinning(false);
        setHasWon(true);
        playWinSound(muted);
      }
    };
    
    setTimeout(tick, currentDelay);
  };

  const handleOpen = () => {
    setIsOpen(true);
    // Auto-select a random start item
    if (selectedIdx === null && data.length > 0) {
      setSelectedIdx(Math.floor(Math.random() * data.length));
    }
  };

  const handleClose = () => {
    if (spinning) return; // Prevent closing while spinning
    setIsOpen(false);
    setHasWon(false);
  };

  const handleNavigate = () => {
    if (selectedIdx === null) return;
    const portfolio = data[selectedIdx];
    setIsOpen(false);
    setHasWon(false);
    navigate({
      to: "/portfolio/$slug",
      params: { slug: slugFor(portfolio) },
    });
  };

  const currentPortfolio = selectedIdx !== null ? data[selectedIdx] : null;

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-brand-green to-brand-blue text-white shadow-xl hover:scale-110 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-ring border border-white/20 group"
        aria-label="Inspire Me Slot Machine"
      >
        <Dices className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
        <span className="absolute -top-8 right-0 scale-0 rounded bg-brand-ink px-2 py-1 text-[10px] font-medium text-white transition-all group-hover:scale-100 shadow whitespace-nowrap">
          Inspire Me! 🎲
        </span>
      </button>

      {/* Overlay Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md transition-all duration-300">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-2xl text-center flex flex-col justify-between min-h-[400px]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border/40">
              <div className="flex items-center gap-1.5 text-left">
                <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
                <div>
                  <h3 className="font-display font-bold text-base text-foreground leading-none">Portfolio Roulette</h3>
                  <span className="text-[10px] text-muted-foreground">Discover randomly from {data.length.toLocaleString()} sites</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Volume Toggle */}
                <button
                  onClick={toggleMute}
                  className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  aria-label={muted ? "Unmute" : "Mute"}
                >
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                {/* Close Button */}
                <button
                  onClick={handleClose}
                  disabled={spinning}
                  className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Close modal"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Main Spin Section */}
            <div className="my-auto py-8">
              <div
                className={`relative overflow-hidden rounded-2xl border p-6 bg-brand-ink transition-all duration-500 ${
                  hasWon
                    ? "border-amber-400 ring-4 ring-amber-400/20 shadow-lg shadow-amber-400/10 scale-105"
                    : spinning
                      ? "border-brand-blue/60 ring-2 ring-brand-blue/10 animate-pulse"
                      : "border-border bg-background/50"
                }`}
              >
                {currentPortfolio ? (
                  <div className="space-y-3 min-h-[120px] flex flex-col justify-center select-none">
                    {/* Category Tag */}
                    <div>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-bold border transition-colors ${
                          hasWon
                            ? "bg-amber-400/15 border-amber-400/30 text-amber-400"
                            : "bg-primary/10 border-primary/20 text-primary"
                        }`}
                      >
                        {categoryFor(currentPortfolio)}
                      </span>
                    </div>

                    {/* Developer Name */}
                    <h4 className="font-display text-2xl font-extrabold text-white tracking-tight line-clamp-1">
                      {currentPortfolio.name}
                    </h4>

                    {/* Developer Tagline / Role */}
                    <p className="text-xs text-slate-300 line-clamp-2 h-8 px-4">
                      {currentPortfolio.tagline ?? "Software Developer"}
                    </p>

                    {/* Developer URL */}
                    <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-mono">
                      <Globe className="h-3 w-3 shrink-0 text-slate-500" />
                      <span className="truncate max-w-[200px]">{new URL(currentPortfolio.url).hostname}</span>
                    </div>
                  </div>
                ) : (
                  <div className="min-h-[120px] flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">No portfolios available</p>
                  </div>
                )}

                {/* Spin Overlay Light Animations */}
                {spinning && (
                  <div className="absolute inset-0 bg-brand-blue/5 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                    <Dices className="h-10 w-10 text-brand-blue animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 border-t border-border/40 pt-4">
              {hasWon ? (
                <div className="flex gap-2">
                  <button
                    onClick={startSpin}
                    className="flex-1 rounded-xl border border-border bg-card py-3 text-xs font-bold text-foreground hover:bg-accent transition-colors"
                  >
                    Spin Again 🔄
                  </button>
                  <button
                    onClick={handleNavigate}
                    className="flex-2 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3 text-xs font-extrabold text-amber-950 shadow-md hover:brightness-105 transition-all"
                  >
                    Go to Portfolio <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={startSpin}
                  disabled={spinning}
                  className="w-full rounded-xl bg-gradient-to-r from-brand-green to-brand-blue py-3.5 text-xs font-bold text-white shadow-md hover:brightness-105 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {spinning ? "Selecting..." : "Spin the Wheel 🎰"}
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
