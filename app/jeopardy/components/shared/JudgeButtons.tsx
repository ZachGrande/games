import { ACTION_BUTTON, TONE } from "./ui";

export default function JudgeButtons({
  onJudge,
  disabled,
  shortcuts,
  className,
}: {
  onJudge: (correct: boolean) => void;
  disabled?: boolean;
  /** Show the C / W keyboard hints. */
  shortcuts?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onJudge(true)}
        className={`${ACTION_BUTTON} ${TONE.correct}`}
      >
        ✓ Correct{shortcuts && <> <kbd className="text-xs opacity-70">C</kbd></>}
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onJudge(false)}
        className={`${ACTION_BUTTON} ${TONE.wrong}`}
      >
        ✗ Wrong{shortcuts && <> <kbd className="text-xs opacity-70">W</kbd></>}
      </button>
    </div>
  );
}
