import { AlertTriangle, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserPriority } from '@/types';
import { cn } from '@/lib/utils';

interface UserPriorityBadgeProps {
  priority: UserPriority;
  isOverride?: boolean;
  onClick?: () => void;
  showEditButton?: boolean;
  size?: 'sm' | 'default';
  className?: string;
}

const priorityConfig: Record<UserPriority, { label: string; className: string }> = {
  urgent: {
    label: 'Urgent',
    className: 'bg-destructive/20 text-destructive border-destructive/30 hover:bg-destructive/30',
  },
  high: {
    label: 'High',
    className: 'bg-risk-high/20 text-risk-high border-risk-high/30 hover:bg-risk-high/30',
  },
  medium: {
    label: 'Medium',
    className: 'bg-risk-medium/20 text-risk-medium border-risk-medium/30 hover:bg-risk-medium/30',
  },
  low: {
    label: 'Low',
    className: 'bg-risk-low/20 text-risk-low border-risk-low/30 hover:bg-risk-low/30',
  },
  none: {
    label: 'None',
    className: 'bg-muted text-muted-foreground border-border hover:bg-muted/80',
  },
};

export function UserPriorityBadge({
  priority,
  isOverride = false,
  onClick,
  showEditButton = false,
  size = 'default',
  className,
}: UserPriorityBadgeProps) {
  const config = priorityConfig[priority];

  if (showEditButton) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={cn(
          'gap-1.5 border',
          size === 'sm' ? 'h-6 text-xs px-2' : 'h-7 text-xs px-2',
          config.className,
          className
        )}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
      >
        {isOverride && priority !== 'none' && (
          <AlertTriangle className="h-3 w-3" />
        )}
        {priority === 'none' ? 'Set Priority' : `Override: ${config.label}`}
        <ChevronDown className="h-3 w-3 opacity-50" />
      </Button>
    );
  }

  if (priority === 'none') {
    return (
      <Badge
        variant="outline"
        className={cn(
          size === 'sm' ? 'text-[10px] px-1.5 py-0' : 'text-xs',
          'text-muted-foreground border-dashed',
          className
        )}
      >
        —
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1',
        size === 'sm' ? 'text-[10px] px-1.5 py-0' : 'text-xs',
        config.className,
        className
      )}
    >
      {isOverride && <AlertTriangle className="h-2.5 w-2.5" />}
      {isOverride ? `Override: ${config.label}` : config.label}
    </Badge>
  );
}
