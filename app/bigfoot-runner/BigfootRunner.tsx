"use client";

import { DebugLadybugToggle, DebugOverlay } from "./DebugUi";
import GameOverOverlay from "./GameOverOverlay";
import Hud from "./Hud";
import Leaderboard from "./Leaderboard";
import TitleOverlay from "./TitleOverlay";
import { useBigfootGame } from "./useBigfootGame";
import { useLeaderboard } from "./useLeaderboard";

export default function BigfootRunner() {
  const {
    canvasRef,
    gameState,
    score,
    best,
    speedLabel,
    debugEnabled,
    toggleDebug,
    debugFps,
    debugDt,
    debugDpr,
    startGame,
  } = useBigfootGame();

  const { scores, loading, refresh, saveScore } = useLeaderboard();

  return (
    <div className="relative mx-auto w-full max-w-190 font-mono">
      <DebugLadybugToggle enabled={debugEnabled} onToggle={toggleDebug} />

      <div className="relative overflow-hidden rounded-2xl border-2 border-[#2d6e2d] shadow-[0_10px_30px_-10px_rgba(20,60,20,0.6)]">
        {/* Canvas */}
        <canvas ref={canvasRef} className="block w-full cursor-pointer" />

        <DebugOverlay visible={debugEnabled} fps={debugFps} dtMs={debugDt} dpr={debugDpr} />

        <Hud score={score} best={best} speedLabel={speedLabel} />

        {gameState === "title" && <TitleOverlay onStart={startGame} />}

        {gameState === "gameover" && (
          <GameOverOverlay
            score={score}
            best={best}
            onSave={(name) => saveScore(name, score)}
            onRestart={startGame}
          />
        )}
      </div>

      <Leaderboard scores={scores} loading={loading} onRefresh={refresh} />
    </div>
  );
}
