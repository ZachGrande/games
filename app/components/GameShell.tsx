import Link from "next/link";
import type { ReactNode } from "react";

export default function GameShell({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col justify-start gap-8 px-6 py-12 bg-white dark:bg-black sm:gap-10 sm:px-16 sm:py-16">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            {title}
          </h1>
          <Link
            href="/"
            className="text-sm text-zinc-500 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            ← Back
          </Link>
        </div>

        {children ?? (
          <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-zinc-200 text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
            Game here
          </div>
        )}
      </main>
    </div>
  );
}
