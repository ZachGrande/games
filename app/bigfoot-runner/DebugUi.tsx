"use client";

type DebugLadybugToggleProps = {
  enabled: boolean;
  onToggle: () => void;
};

type DebugOverlayProps = {
  visible: boolean;
  fps: number;
  dtMs: number;
  dpr: number;
};

export function DebugLadybugToggle({ enabled, onToggle }: DebugLadybugToggleProps) {
  return (
    <button
      type="button"
      aria-label={enabled ? "Disable debug overlay" : "Enable debug overlay"}
      aria-pressed={enabled}
      onClick={onToggle}
      className="absolute -top-4 -right-4 z-110 grid h-10 w-10 appearance-none place-items-center rounded-full border border-[#b8b8b8] bg-[#e0e0e0] shadow-[0_2px_8px_rgba(0,0,0,0.25)] transition-transform hover:-translate-y-0.5 hover:bg-[#e7e7e7] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#bdbdbd] focus-visible:ring-offset-1 focus-visible:ring-offset-white active:translate-y-0"
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
        <path d="M10.8 5.6 9.2 3.7M13.2 5.6l1.6-1.9" stroke="#8a8a8a" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="12" cy="7" r="2.4" fill="#9c9c9c" />
        <ellipse cx="12" cy="14.5" rx="6.4" ry="7.1" fill="#bdbdbd" stroke="#909090" strokeWidth="1.1" />
        <path d="M12 8.1v13" stroke="#8d8d8d" strokeWidth="1" />
        <circle cx="9.2" cy="12.1" r="1.15" fill="#8d8d8d" />
        <circle cx="14.8" cy="12.1" r="1.15" fill="#8d8d8d" />
        <circle cx="8.7" cy="16.1" r="1.15" fill="#8d8d8d" />
        <circle cx="15.3" cy="16.1" r="1.15" fill="#8d8d8d" />
      </svg>
    </button>
  );
}

export function DebugOverlay({ visible, fps, dtMs, dpr }: DebugOverlayProps) {
  if (!visible) return null;

  return (
    <div className="pointer-events-none absolute right-3 bottom-3 z-20 rounded-md border border-[#a8a8a8] bg-[rgba(245,245,245,0.9)] px-2 py-1 font-mono text-[11px] leading-snug tracking-[0.2px] text-[#444]">
      FPS {fps} | dt {dtMs.toFixed(1)}ms | DPR {dpr.toFixed(2)}
    </div>
  );
}
