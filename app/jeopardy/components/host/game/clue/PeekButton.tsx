"use client";

import { useState } from "react";

export default function PeekButton({ answer }: { answer: string }) {
  const [peeking, setPeeking] = useState(false);

  return (
    <button
      type="button"
      onPointerDown={() => setPeeking(true)}
      onPointerUp={() => setPeeking(false)}
      onPointerLeave={() => setPeeking(false)}
      className="select-none rounded-lg border border-blue-700 px-3 py-2 text-sm text-blue-200"
    >
      {peeking ? answer || "(no response entered)" : "Hold to peek at response"}
    </button>
  );
}
