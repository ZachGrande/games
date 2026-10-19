import { formatMoney } from "../../lib/format";
import type { Player } from "../../lib/types";

export default function PlayerHeader({ title, code, me }: { title?: string; code: string; me: Player | undefined }) {
  return (
    <header className="flex items-center justify-between border-b border-blue-900 px-4 py-3">
      <span className="text-sm text-blue-300">
        {title ?? "Jeopardy!"} · <span className="font-mono tracking-widest">{code}</span>
      </span>
      {me && (
        <span className="flex items-baseline gap-2">
          <span className="font-medium">{me.name}</span>
          <span className={`text-xl font-bold ${me.score < 0 ? "text-red-400" : "text-amber-300"}`}>
            {formatMoney(me.score)}
          </span>
        </span>
      )}
    </header>
  );
}
