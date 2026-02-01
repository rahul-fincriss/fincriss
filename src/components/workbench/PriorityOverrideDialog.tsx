import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { UserPriority } from '@/types';
import { priorityReasonCategories } from '@/data/mockData';

interface PriorityOverrideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerName: string;
  currentPriority: UserPriority;
  onConfirm: (priority: UserPriority, category: string, reason: string) => void;
}

const priorityOptions: { value: UserPriority; label: string; description: string }[] = [
  { value: 'urgent', label: 'Urgent', description: 'Immediate attention required' },
  { value: 'high', label: 'High', description: 'Priority escalation' },
  { value: 'medium', label: 'Medium', description: 'Standard priority' },
  { value: 'low', label: 'Low', description: 'Deprioritize' },
  { value: 'none', label: 'None (Clear Override)', description: 'Revert to FinCrisS priority' },
];

const priorityColors: Record<UserPriority, string> = {
  urgent: 'bg-destructive/20 text-destructive border-destructive/30',
  high: 'bg-risk-high/20 text-risk-high border-risk-high/30',
  medium: 'bg-risk-medium/20 text-risk-medium border-risk-medium/30',
  low: 'bg-risk-low/20 text-risk-low border-risk-low/30',
  none: 'bg-muted text-muted-foreground border-border',
};

export function PriorityOverrideDialog({
  open,
  onOpenChange,
  customerName,
  currentPriority,
  onConfirm,
}: PriorityOverrideDialogProps) {
  const [selectedPriority, setSelectedPriority] = useState<UserPriority>(currentPriority);
  const [category, setCategory] = useState<string>('');
  const [reason, setReason] = useState<string>('');

  const handleConfirm = () => {
    if (!category || !reason.trim()) return;
    onConfirm(selectedPriority, category, reason);
    // Reset form
    setCategory('');
    setReason('');
    onOpenChange(false);
  };

  const isValid = category && reason.trim().length > 0 && selectedPriority !== currentPriority;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Set User Priority Override
          </DialogTitle>
          <DialogDescription>
            Override FinCrisS priority for <span className="font-medium text-foreground">{customerName}</span>.
            This affects sorting and filtering for all alerts under this customer.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 text-sm text-warning-foreground">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5 text-warning flex-shrink-0" />
            <div>
              <p className="font-medium">Governance Notice</p>
              <p className="text-xs text-muted-foreground mt-1">
                Priority overrides are logged in audit history and affect system behavior.
                A reason is required for all changes.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Select Priority</Label>
            <div className="grid grid-cols-5 gap-2">
              {priorityOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedPriority(option.value)}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    selectedPriority === option.value
                      ? `${priorityColors[option.value]} ring-2 ring-offset-2 ring-offset-background ring-primary`
                      : 'border-border hover:border-muted-foreground/50'
                  }`}
                >
                  <span className="text-xs font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Reason Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {priorityReasonCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Justification *</Label>
            <Textarea
              id="reason"
              placeholder="Provide detailed justification for this priority override..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              This will be recorded in the audit trail.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!isValid}>
            Confirm Override
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
