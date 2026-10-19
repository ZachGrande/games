export default function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-950 p-6 text-center text-lg text-blue-100">
      <p>{children}</p>
    </div>
  );
}
