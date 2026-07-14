import type { SVGProps } from "react";

export type ShapeId =
  | "circle"
  | "square"
  | "triangle"
  | "diamond"
  | "star"
  | "hexagon"
  | "cross"
  | "ring";

export type Card = {
  /** Unique id per card instance. */
  id: number;
  /** Which shape this card shows; a matching pair shares the same shapeId. */
  shapeId: ShapeId;
  /** True once the pair has been found. */
  matched: boolean;
};

const baseProps: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 100 100",
  xmlns: "http://www.w3.org/2000/svg",
  "aria-hidden": true,
};

/** 8 visually distinct geometric shapes, one per pair. */
export const SHAPES: Record<
  ShapeId,
  (props: SVGProps<SVGSVGElement>) => React.ReactElement
> = {
  circle: (props) => (
    <svg {...baseProps} {...props}>
      <circle cx={50} cy={50} r={34} fill="#ef4444" />
    </svg>
  ),
  square: (props) => (
    <svg {...baseProps} {...props}>
      <rect x={22} y={22} width={56} height={56} rx={8} fill="#f59e0b" />
    </svg>
  ),
  triangle: (props) => (
    <svg {...baseProps} {...props}>
      <path d="M50 18 L82 78 L18 78 Z" fill="#22c55e" />
    </svg>
  ),
  diamond: (props) => (
    <svg {...baseProps} {...props}>
      <path d="M50 16 L84 50 L50 84 L16 50 Z" fill="#06b6d4" />
    </svg>
  ),
  star: (props) => (
    <svg {...baseProps} {...props}>
      <path
        d="M50 14 L61 40 L89 42 L67 60 L74 88 L50 72 L26 88 L33 60 L11 42 L39 40 Z"
        fill="#eab308"
      />
    </svg>
  ),
  hexagon: (props) => (
    <svg {...baseProps} {...props}>
      <path d="M50 15 L83 33 L83 67 L50 85 L17 67 L17 33 Z" fill="#8b5cf6" />
    </svg>
  ),
  cross: (props) => (
    <svg {...baseProps} {...props}>
      <path
        d="M40 18 H60 V40 H82 V60 H60 V82 H40 V60 H18 V40 H40 Z"
        fill="#ec4899"
      />
    </svg>
  ),
  ring: (props) => (
    <svg {...baseProps} {...props}>
      <circle
        cx={50}
        cy={50}
        r={28}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={16}
      />
    </svg>
  ),
};

export const SHAPE_IDS = Object.keys(SHAPES) as ShapeId[];

/** Fisher-Yates shuffle (returns a new array). */
function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Build a shuffled 16-card deck: two of each of the 8 shapes. */
export function buildDeck(): Card[] {
  const pairs = SHAPE_IDS.flatMap((shapeId) => [shapeId, shapeId]);
  return shuffle(pairs).map((shapeId, index) => ({
    id: index,
    shapeId,
    matched: false,
  }));
}
