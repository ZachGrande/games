"use client";

import { useParams } from "next/navigation";
import AnswerKey from "../../../components/host/game/AnswerKey";
import HostGate from "../../../components/host/HostGate";

export default function AnswerKeyPage() {
  const { code } = useParams<{ code: string }>();
  return (
    <HostGate fallbackClassName="m-auto max-w-md p-6">
      {(user) => <AnswerKey user={user} code={code.toUpperCase()} />}
    </HostGate>
  );
}
