import GameShell from "../components/GameShell";
import JoinForm from "./components/JoinForm";

export default function JeopardyPage() {
  return (
    <GameShell title="Jeopardy!">
      <JoinForm />
    </GameShell>
  );
}
