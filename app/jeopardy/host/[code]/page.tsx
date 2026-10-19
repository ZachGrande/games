"use client";

import { useParams } from "next/navigation";
import HostGame from "../../components/HostGame";
import HostGate from "../../components/HostGate";

export default function HostGamePage() {
  const { code } = useParams<{ code: string }>();
  return (
    <HostGate fallbackClassName="m-auto max-w-md p-6">
      {(user) => <HostGame user={user} code={code.toUpperCase()} />}
    </HostGate>
  );
}
