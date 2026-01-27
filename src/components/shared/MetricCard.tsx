import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'risk-high' | 'risk-medium' | 'risk-low';
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
}: MetricCardProps) {
  const variantClasses = {
    default: 'from-card to-muted/30',
    'risk-high': 'from-risk-high/10 to-risk-high/5 border-risk-high/30',
    'risk-medium': 'from-risk-medium/10 to-risk-medium/5 border-risk-medium/30',
    'risk-low': 'from-risk-low/10 to-risk-low/5 border-risk-low/30',
  };

  const iconClasses = {
    default: 'bg-primary/20 text-primary',
    'risk-high': 'bg-risk-high/20 text-risk-high',
    'risk-medium': 'bg-risk-medium/20 text-risk-medium',
    'risk-low': 'bg-risk-low/20 text-risk-low',
  };

  return (
    <div
      className={cn(
        'metric-card bg-gradient-to-br border transition-all hover:shadow-glow',
        variantClasses[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <p
              className={cn(
                'mt-1 text-xs font-medium',
                trend.isPositive ? 'text-risk-low' : 'text-risk-high'
              )}
            >
              {trend.isPositive ? '↓' : '↑'} {Math.abs(trend.value)}% from last week
            </p>
          )}
        </div>
        <div className={cn('rounded-lg p-2.5', iconClasses[variant])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
