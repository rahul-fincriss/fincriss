import { ChevronDown, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { QueueType } from '@/types';
import { cn } from '@/lib/utils';

interface QueueTypeDropdownProps {
  currentQueue?: QueueType;
  onQueueChange: (queue: QueueType) => void;
  compact?: boolean;
}

export const queueTypeLabels: Record<QueueType, string> = {
  default_aml: 'Default AML Queue',
  pep_sanctions: 'PEP / Sanctions Queue',
  high_value: 'High-Value Transactions Queue',
  cash_structuring: 'Cash / Structuring Queue',
  trade_based: 'Trade-Based AML Queue',
  behavioral_anomaly: 'Behavioral Anomaly Queue',
};

export const queueTypeShortLabels: Record<QueueType, string> = {
  default_aml: 'Default AML',
  pep_sanctions: 'PEP / Sanctions',
  high_value: 'High-Value',
  cash_structuring: 'Cash / Structuring',
  trade_based: 'Trade-Based AML',
  behavioral_anomaly: 'Behavioral Anomaly',
};

const queueTypeColors: Record<QueueType, string> = {
  default_aml: 'bg-muted text-muted-foreground border-border',
  pep_sanctions: 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30',
  high_value: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
  cash_structuring: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30',
  trade_based: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/30',
  behavioral_anomaly: 'bg-pink-500/15 text-pink-700 dark:text-pink-400 border-pink-500/30',
};

export function QueueTypeDropdown({
  currentQueue,
  onQueueChange,
  compact = false,
}: QueueTypeDropdownProps) {
  const displayQueue = currentQueue || 'default_aml';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'gap-1.5 border font-normal',
            compact ? 'h-6 text-[10px] px-2' : 'h-7 text-xs px-2',
            queueTypeColors[displayQueue]
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <Layers className={cn(compact ? 'h-2.5 w-2.5' : 'h-3 w-3')} />
          {compact ? queueTypeShortLabels[displayQueue] : queueTypeShortLabels[displayQueue]}
          <ChevronDown className={cn('opacity-50', compact ? 'h-2.5 w-2.5' : 'h-3 w-3')} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[220px]">
        {(Object.keys(queueTypeLabels) as QueueType[]).map((queue) => (
          <DropdownMenuItem
            key={queue}
            onClick={(e) => {
              e.stopPropagation();
              onQueueChange(queue);
            }}
            className={cn(
              'cursor-pointer',
              currentQueue === queue && 'bg-accent'
            )}
          >
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn('text-[10px] px-1.5 py-0', queueTypeColors[queue])}
              >
                <Layers className="h-2.5 w-2.5 mr-1" />
              </Badge>
              <span className="text-sm">{queueTypeLabels[queue]}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function QueueTypeBadge({ queue, className }: { queue?: QueueType; className?: string }) {
  const displayQueue = queue || 'default_aml';
  
  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1 text-xs',
        queueTypeColors[displayQueue],
        className
      )}
    >
      <Layers className="h-3 w-3" />
      {queueTypeShortLabels[displayQueue]}
    </Badge>
  );
}
