import { cn } from '@/lib/utils';
import { AlertStatus, CaseStatus, STRStatus } from '@/types';

type Status = AlertStatus | CaseStatus | STRStatus;

interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md';
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  // Alert statuses
  new: { label: 'New', className: 'badge-status-pending' },
  in_review: { label: 'In Review', className: 'badge-status-in-progress' },
  sent_to_maps: { label: 'Processing', className: 'badge-status-in-progress' },
  dropped: { label: 'Dropped', className: 'bg-muted text-muted-foreground' },
  case_created: { label: 'Case Created', className: 'badge-status-completed' },
  
  // Case statuses
  open: { label: 'Open', className: 'badge-status-pending' },
  investigation: { label: 'Investigation', className: 'badge-status-in-progress' },
  str_draft: { label: 'STR Draft', className: 'badge-status-in-progress' },
  pending_review: { label: 'Pending Review', className: 'badge-status-pending' },
  submitted: { label: 'Submitted', className: 'badge-status-completed' },
  closed: { label: 'Closed', className: 'bg-muted text-muted-foreground' },
  
  // STR statuses
  draft: { label: 'Draft', className: 'badge-status-pending' },
  pending_po_review: { label: 'Pending PO Review', className: 'badge-status-pending' },
  approved: { label: 'Approved', className: 'badge-status-completed' },
  rejected: { label: 'Rejected', className: 'bg-destructive/20 text-destructive border border-destructive/30' },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'bg-muted' };
  
  const sizeClasses = {
    sm: 'h-5 px-1.5 text-xs',
    md: 'h-6 px-2 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium',
        sizeClasses[size],
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
