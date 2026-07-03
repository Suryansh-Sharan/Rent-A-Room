import { cn } from '@/lib/utils';
import { Sparkles, CheckCircle, AlertTriangle } from 'lucide-react';

interface CompatibilityBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  isRuleBased?: boolean;
}

function getMatchQuality(score: number) {
  if (score >= 90) return { label: 'Excellent Match', color: 'text-emerald-400', ring: '#34d399', bg: 'bg-emerald-400/10' };
  if (score >= 75) return { label: 'Good Match', color: 'text-gold', ring: '#c8a02a', bg: 'bg-gold/10' };
  if (score >= 60) return { label: 'Fair Match', color: 'text-amber-400', ring: '#f59e0b', bg: 'bg-amber-400/10' };
  return { label: 'Low Match', color: 'text-silver', ring: '#9ca3af', bg: 'bg-muted' };
}

export default function CompatibilityBadge({ score, size = 'md', showLabel = true, className, isRuleBased }: CompatibilityBadgeProps) {
  const quality = getMatchQuality(score);
  const radius = size === 'lg' ? 36 : size === 'sm' ? 20 : 28;
  const stroke = size === 'lg' ? 4 : size === 'sm' ? 2.5 : 3;
  const svgSize = (radius + stroke) * 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - score / 100);

  const textSize = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-xs' : 'text-sm';
  const labelSize = size === 'lg' ? 'text-sm' : 'text-xs';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative inline-flex items-center justify-center compat-ring">
        <svg
          width={svgSize}
          height={svgSize}
          className="-rotate-90"
          viewBox={`0 0 ${svgSize} ${svgSize}`}
        >
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={stroke}
          />
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke={quality.ring}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <span className={cn('absolute font-bold tabular-nums', textSize, quality.color)}>
          {score}%
        </span>
      </div>
      {showLabel && (
        <div className="flex flex-col">
          <span className={cn('font-semibold', labelSize, quality.color)}>{quality.label}</span>
          {isRuleBased && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <AlertTriangle className="h-2.5 w-2.5" />
              Rule-based
            </span>
          )}
        </div>
      )}
    </div>
  );
}
