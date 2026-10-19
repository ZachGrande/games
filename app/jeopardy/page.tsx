import GameShell from "../components/GameShell";
import JoinForm from "./components/landing/JoinForm";

export default function JeopardyPage() {
  return (
    <GameShell title="Jeopardy!">
      <JoinForm />
    </GameShell>
  );
}
