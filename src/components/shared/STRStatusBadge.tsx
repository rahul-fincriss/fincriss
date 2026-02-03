import { Badge } from '@/components/ui/badge';
import { STRStatusType } from '@/types';
import { FileText, FileCheck, Download, XCircle, FileX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface STRStatusBadgeProps {
  status: STRStatusType;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  highlighted?: boolean;
}

const strStatusConfig: Record<STRStatusType, {
  label: string;
  icon: React.ElementType;
  className: string;
}> = {
  no_str: {
    label: 'No STR',
    icon: FileX,
    className: 'bg-muted text-muted-foreground border-muted-foreground/20',
  },
  draft_in_progress: {
    label: 'Draft In Progress',
    icon: FileText,
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400',
  },
  str_ready: {
    label: 'STR Ready',
    icon: FileCheck,
    className: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/40 dark:text-emerald-400 font-semibold',
  },
  str_downloaded: {
    label: 'STR Downloaded',
    icon: Download,
    className: 'bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400',
  },
  discarded: {
    label: 'Discarded',
    icon: XCircle,
    className: 'bg-muted text-muted-foreground border-muted-foreground/20 line-through',
  },
};

export function STRStatusBadge({ status, size = 'md', showIcon = true, highlighted = false }: STRStatusBadgeProps) {
  const config = strStatusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        config.className,
        size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1',
        highlighted && status === 'str_ready' && 'ring-2 ring-emerald-500/50 ring-offset-1 ring-offset-background',
        'gap-1.5'
      )}
    >
      {showIcon && <Icon className={cn(size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} />}
      {config.label}
    </Badge>
  );
}
