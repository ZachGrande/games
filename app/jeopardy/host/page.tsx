"use client";

import GameShell from "../../components/GameShell";
import HostDashboard from "../components/host/dashboard/HostDashboard";
import HostGate from "../components/host/HostGate";

export default function JeopardyHostPage() {
  return (
    <GameShell title="Host Jeopardy!">
      <HostGate>{(user) => <HostDashboard user={user} />}</HostGate>
    </GameShell>
  );
}
