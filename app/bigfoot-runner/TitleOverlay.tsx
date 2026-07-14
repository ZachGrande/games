"use client";

type TitleOverlayProps = {
  onStart: () => void;
};

export default function TitleOverlay({ onStart }: TitleOverlayProps) {
  return (
    <div
      onClick={onStart}
      className="absolute inset-0 z-100 flex cursor-pointer select-none flex-col items-center justify-center bg-[linear-gradient(180deg,#5ba8e0_0%,#8dc8f0_40%,#4a9e4a_70%,#2d6e2d_100%)] p-5 text-center"
    >
      <div className="animate-[breathe_2s_ease-in-out_infinite] text-[72px] leading-none drop-shadow-[0_4px_8px_rgba(0,80,0,0.5)]">
        🦶
      </div>
      <div className="my-1.5 text-[clamp(22px,7vw,44px)] font-bold leading-[0.95] tracking-[2px] text-white [text-shadow:3px_3px_0_#2a5a1a]">
        BIGFOOT
        <br />
        RUNNER
      </div>
      <div className="my-1.5 mb-4 text-xs font-bold uppercase tracking-[3px] text-[#1a4a1a]">
        Stay hidden. Stay wild.
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onStart();
        }}
        className="rounded-md bg-[#e8780a] px-8 py-3 text-[15px] font-bold tracking-[2px] text-white shadow-[4px_4px_0_#5c3d1e] transition-transform hover:-translate-y-0.5 hover:shadow-[4px_6px_0_#5c3d1e] active:translate-y-0.5 active:shadow-[4px_2px_0_#5c3d1e]"
      >
        START RUNNING
      </button>
      <div className="mt-3.5 text-[11px] font-bold leading-[1.8] text-[#1a4a1a]">
        TAP / SPACE to jump · Double-jump!
        <br />⭐ Collect badges &amp; food
        <br />🏕️ Dodge tents, campfires &amp; lanterns
      </div>
    </div>
  );
}
