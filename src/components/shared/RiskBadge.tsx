import { cn } from '@/lib/utils';
import { RiskLevel } from '@/types';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function RiskBadge({ level, size = 'md', showLabel = true }: RiskBadgeProps) {
  const sizeClasses = {
    sm: 'h-5 px-1.5 text-xs',
    md: 'h-6 px-2 text-sm',
    lg: 'h-7 px-3 text-sm',
  };

  const levelConfig = {
    high: {
      className: 'badge-risk-high',
      label: 'High',
    },
    medium: {
      className: 'badge-risk-medium',
      label: 'Medium',
    },
    low: {
      className: 'badge-risk-low',
      label: 'Low',
    },
  };

  const config = levelConfig[level];

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-md font-semibold',
        sizeClasses[size],
        config.className
      )}
    >
      {showLabel ? config.label : level[0].toUpperCase()}
    </span>
  );
}
