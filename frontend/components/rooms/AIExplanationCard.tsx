import { Sparkles, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CompatibilityBreakdown } from '@/lib/mock/compatibility';

interface AIExplanationCardProps {
  breakdown: CompatibilityBreakdown;
  className?: string;
}

export default function AIExplanationCard({ breakdown, className }: AIExplanationCardProps) {
  return (
    <div className={cn('glass-gold rounded-xl p-5 space-y-4', className)}>
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-lg bg-gold/20 flex items-center justify-center">
          <Sparkles className="h-3.5 w-3.5 text-gold" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gold">AI Compatibility Analysis</h3>
          {!breakdown.isAIBased && (
            <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
              <AlertTriangle className="h-2.5 w-2.5" />
              Rule-based fallback mode
            </span>
          )}
        </div>
      </div>

      {/* Score breakdown */}
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(breakdown.breakdown).map(([key, val]) => (
          <div key={key} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground capitalize">{key}</span>
              <span className="text-xs font-semibold text-gold">{val}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gold-gradient"
                style={{ width: `${val}%`, transition: 'width 0.6s ease' }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Strengths */}
      <div>
        <p className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-1">
          <CheckCircle className="h-3.5 w-3.5" />
          Strengths
        </p>
        <div className="flex flex-wrap gap-1.5">
          {breakdown.strengths.map((s) => (
            <span key={s} className="inline-flex items-center gap-1 text-[11px] bg-emerald-400/10 text-emerald-400 rounded-full px-2 py-0.5">
              <CheckCircle className="h-2.5 w-2.5" />
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Missing */}
      {breakdown.missing.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-1">
            <XCircle className="h-3.5 w-3.5" />
            Missing Preferences
          </p>
          <div className="flex flex-wrap gap-1.5">
            {breakdown.missing.map((m) => (
              <span key={m} className="inline-flex items-center gap-1 text-[11px] bg-red-400/10 text-red-400 rounded-full px-2 py-0.5">
                <XCircle className="h-2.5 w-2.5" />
                {m}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* AI Explanation */}
      <div className="pt-1 border-t border-gold/10">
        <p className="text-xs text-muted-foreground leading-relaxed">{breakdown.aiExplanation}</p>
      </div>
    </div>
  );
}
