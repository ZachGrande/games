export default function PresenceDot({ connected, size = "sm" }: { connected: boolean; size?: "sm" | "md" }) {
  return (
    <span
      className={`rounded-full ${size === "md" ? "h-2.5 w-2.5" : "h-2 w-2"} ${connected ? "bg-emerald-400" : "bg-zinc-500"}`}
      aria-label={connected ? "online" : "offline"}
    />
  );
}
