import { cn } from '@/lib/utils';
import type { MatchScoreBreakdown } from '@/lib/matching/types';

interface MatchScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

function scoreTone(score: number) {
  if (score >= 85) return { ring: 'text-success', bg: 'bg-success/10', text: 'text-success' };
  if (score >= 65) return { ring: 'text-primary', bg: 'bg-primary/10', text: 'text-primary' };
  if (score >= 40) return { ring: 'text-warning', bg: 'bg-warning/10', text: 'text-warning' };
  return { ring: 'text-destructive', bg: 'bg-destructive/10', text: 'text-destructive' };
}

/** Circular match-score badge, e.g. "94% Match". */
export function MatchScoreBadge({ score, size = 'md' }: MatchScoreBadgeProps) {
  const tone = scoreTone(score);
  const dims = size === 'lg' ? 'h-20 w-20 text-xl' : size === 'sm' ? 'h-10 w-10 text-xs' : 'h-14 w-14 text-sm';
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-full font-bold',
        tone.bg,
        tone.text,
        dims
      )}
      role="img"
      aria-label={`${score}% match`}
    >
      <span>{Math.round(score)}%</span>
    </div>
  );
}

const DIMENSION_LABELS: Array<{ key: keyof MatchScoreBreakdown; label: string }> = [
  { key: 'routeScore', label: 'Route Match' },
  { key: 'capacityScore', label: 'Capacity Match' },
  { key: 'timeScore', label: 'Time Match' },
  { key: 'vehicleScore', label: 'Vehicle Match' },
  { key: 'detourScore', label: 'Detour' },
  { key: 'priceScore', label: 'Price' },
  { key: 'reliabilityScore', label: 'Reliability' },
];

interface MatchScoreBreakdownListProps {
  scores: MatchScoreBreakdown;
}

/** Renders the full "Route Match 95 / Capacity Match 100 / ..." breakdown. */
export function MatchScoreBreakdownList({ scores }: MatchScoreBreakdownListProps) {
  return (
    <dl className="grid grid-cols-2 gap-3 text-sm">
      {DIMENSION_LABELS.map(({ key, label }) => (
        <div key={key} className="flex items-center justify-between gap-2">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="font-medium tabular-nums">{Math.round(scores[key])}</dd>
        </div>
      ))}
      <div className="col-span-2 mt-1 flex items-center justify-between border-t border-border pt-2">
        <dt className="font-semibold">Overall Match</dt>
        <dd className="font-bold tabular-nums">{Math.round(scores.overallScore)}%</dd>
      </div>
    </dl>
  );
}

interface MatchReasonsListProps {
  reasons: string[];
}

/** Renders the explainability checklist, e.g. "✓ Same return route". */
export function MatchReasonsList({ reasons }: MatchReasonsListProps) {
  if (reasons.length === 0) return null;
  return (
    <ul className="space-y-1.5 text-sm">
      {reasons.map((reason, i) => (
        <li key={i} className="flex items-start gap-2 text-foreground">
          <span className="mt-0.5 text-success" aria-hidden>
            ✓
          </span>
          <span>{reason}</span>
        </li>
      ))}
    </ul>
  );
}
