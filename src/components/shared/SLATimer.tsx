import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SLATimerProps {
  deadline: Date;
  size?: 'sm' | 'md';
}

export function SLATimer({ deadline, size = 'md' }: SLATimerProps) {
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  const isOverdue = diff < 0;
  const isCritical = !isOverdue && hours < 4;
  const isWarning = !isOverdue && !isCritical && hours < 24;

  const formatTime = () => {
    if (isOverdue) {
      const overdueHours = Math.abs(hours);
      return `${overdueHours}h overdue`;
    }
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  const sizeClasses = {
    sm: 'text-xs gap-1',
    md: 'text-sm gap-1.5',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
  };

  return (
    <div
      className={cn(
        'flex items-center font-mono',
        sizeClasses[size],
        isOverdue && 'sla-critical',
        isCritical && !isOverdue && 'sla-critical',
        isWarning && 'sla-warning',
        !isOverdue && !isCritical && !isWarning && 'sla-safe'
      )}
    >
      <Clock className={cn(iconSizes[size], isOverdue || isCritical ? 'animate-pulse' : '')} />
      <span>{formatTime()}</span>
    </div>
  );
}
