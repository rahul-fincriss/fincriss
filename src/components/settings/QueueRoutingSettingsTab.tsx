import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { mockPlatformSettings, mockWorkforceQueues } from '@/data/adminMockData';

interface QueueRoutingSettingsTabProps {
  isReadOnly: boolean;
}

export function QueueRoutingSettingsTab({ isReadOnly }: QueueRoutingSettingsTabProps) {
  const [settings, setSettings] = useState(mockPlatformSettings.queueRouting);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const activeQueues = mockWorkforceQueues.filter(q => q.status === 'active');

  const handleSave = () => {
    setShowConfirmDialog(true);
  };

  const confirmSave = () => {
    toast.success('Queue routing settings saved successfully');
    setShowConfirmDialog(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Queues & Routing Defaults</CardTitle>
          <CardDescription>
            Configure default queue assignments and fallback behaviors for alert routing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6">
            {/* Default Queue */}
            <div className="space-y-2">
              <Label htmlFor="defaultQueue">Default Queue for New Alerts</Label>
              <Select
                value={settings.defaultQueueId}
                onValueChange={(value) =>
                  setSettings({ ...settings, defaultQueueId: value })
                }
                disabled={isReadOnly}
              >
                <SelectTrigger id="defaultQueue" className="w-full max-w-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {activeQueues.map((queue) => (
                    <SelectItem key={queue.id} value={queue.id}>
                      {queue.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                New alerts without explicit routing will be assigned to this queue
              </p>
            </div>

            {/* Inactive Queue Fallback */}
            <div className="space-y-2">
              <Label htmlFor="inactiveFallback">When Queue is Inactive</Label>
              <Select
                value={settings.inactiveQueueFallback}
                onValueChange={(value: 'default_aml' | 'hold' | 'escalate') =>
                  setSettings({ ...settings, inactiveQueueFallback: value })
                }
                disabled={isReadOnly}
              >
                <SelectTrigger id="inactiveFallback" className="w-full max-w-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default_aml">
                    Fallback to Default AML Queue
                  </SelectItem>
                  <SelectItem value="hold">
                    Hold in Original Queue (until reactivated)
                  </SelectItem>
                  <SelectItem value="escalate">
                    Escalate to Supervisor
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Behavior when an alert's assigned queue becomes inactive
              </p>
            </div>

            {/* No Active Users Behavior */}
            <div className="space-y-2">
              <Label htmlFor="noUsersBehavior">When Queue Has No Active Users</Label>
              <Select
                value={settings.noActiveUsersBehavior}
                onValueChange={(value: 'queue_default' | 'escalate_to_supervisor' | 'hold') =>
                  setSettings({ ...settings, noActiveUsersBehavior: value })
                }
                disabled={isReadOnly}
              >
                <SelectTrigger id="noUsersBehavior" className="w-full max-w-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="queue_default">
                    Route to Default Queue
                  </SelectItem>
                  <SelectItem value="escalate_to_supervisor">
                    Escalate to Supervisor
                  </SelectItem>
                  <SelectItem value="hold">
                    Hold Until Users Available
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Behavior when a queue has no active users assigned
              </p>
            </div>

            {/* Require Queue Before Case Creation */}
            <div className="flex items-center justify-between p-4 border rounded-lg max-w-md">
              <div className="space-y-0.5">
                <Label>Require Queue Assignment Before Case Creation</Label>
                <p className="text-xs text-muted-foreground">
                  Alerts must be assigned to a queue before being escalated to a case
                </p>
              </div>
              <Switch
                checked={settings.requireQueueBeforeCaseCreation}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, requireQueueBeforeCaseCreation: checked })
                }
                disabled={isReadOnly}
              />
            </div>
          </div>

          {/* Save button */}
          {!isReadOnly && (
            <div className="flex justify-end pt-4 border-t">
              <Button onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Routing Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to update queue routing defaults. These changes will affect how new alerts are assigned.
              Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave}>
              Confirm Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
