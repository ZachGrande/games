export default function FinalHeading({ category }: { category: string }) {
  return (
    <>
      <p className="text-sm font-semibold uppercase tracking-widest text-blue-300">Final Jeopardy!</p>
      <p className="text-3xl font-black uppercase">{category}</p>
    </>
  );
}
