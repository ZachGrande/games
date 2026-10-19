import RecentGame from "./RecentGame";

export default function RecentGames({ codes, uid }: { codes: string[]; uid: string }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-medium text-black dark:text-zinc-50">Your recent games</h2>
      <ul className="flex flex-col gap-2">
        {codes.map((code) => (
          <RecentGame key={code} code={code} uid={uid} />
        ))}
      </ul>
    </section>
  );
}
