type Props = {
  label: string;
  score: number;
  compact?: boolean;
};

export default function ScoreRing({ label, score, compact = false }: Props) {
  const radius = compact ? 28 : 42;
  const stroke = compact ? 7 : 9;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, score)) / 100) * circumference;

  return (
    <div className="flex items-center gap-3">
      <svg
        width={compact ? 72 : 104}
        height={compact ? 72 : 104}
        viewBox={`0 0 ${compact ? 72 : 104} ${compact ? 72 : 104}`}
        aria-label={`${label} ${score}`}
      >
        <circle
          cx={compact ? 36 : 52}
          cy={compact ? 36 : 52}
          r={radius}
          fill="transparent"
          stroke="#d7dee2"
          strokeWidth={stroke}
        />
        <circle
          cx={compact ? 36 : 52}
          cy={compact ? 36 : 52}
          r={radius}
          fill="transparent"
          stroke={score >= 75 ? "#166f73" : score >= 55 ? "#b7791f" : "#c6533f"}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${compact ? 36 : 52} ${compact ? 36 : 52})`}
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          className="fill-ink text-lg font-bold"
        >
          {score}
        </text>
      </svg>
      <div>
        <p className="text-sm font-semibold text-ink">{label}</p>
        <p className="text-xs text-muted">out of 100</p>
      </div>
    </div>
  );
}
