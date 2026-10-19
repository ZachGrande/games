export default function Countdown({ seconds, className = "" }: { seconds: number; className?: string }) {
  return (
    <p className={`font-black tabular-nums ${seconds <= 5 ? "text-red-400" : "text-amber-300"} ${className}`}>
      {seconds}
    </p>
  );
}
