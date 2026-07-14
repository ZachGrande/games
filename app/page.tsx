import Link from "next/link";

const games = [
  {
    href: "/bigfoot-runner",
    title: "Bigfoot Runner",
    description: "Dash through the forest as the legend himself.",
  },
  {
    href: "/match-two",
    title: "Match Two",
    description: "Flip the cards and find every pair.",
  },
  {
    href: "/twenty-forty-eight",
    title: "2048",
    description: "Slide the tiles and merge your way to 2048.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col justify-start gap-8 px-6 py-12 bg-white dark:bg-black sm:gap-10 sm:px-16 sm:py-16">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Games
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">Pick a game.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {games.map((game) => (
            <Link
              key={game.href}
              href={game.href}
              className="group flex flex-col gap-2 rounded-xl border border-zinc-200 p-6 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
            >
              <span className="text-lg font-medium text-black dark:text-zinc-50">
                {game.title}
              </span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {game.description}
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
