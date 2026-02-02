import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Save, Bell, Mail, Monitor } from 'lucide-react';
import { toast } from 'sonner';
import { mockPlatformSettings } from '@/data/adminMockData';
import { NotificationChannel } from '@/types/admin';

interface NotificationSettingsTabProps {
  isReadOnly: boolean;
}

type NotificationType = 'slaWarning' | 'slaBreach' | 'queueAssignment' | 'caseEscalation';

const notificationConfig: { key: NotificationType; label: string; description: string }[] = [
  {
    key: 'slaWarning',
    label: 'SLA Warning Notifications',
    description: 'Notify when alerts approach SLA thresholds',
  },
  {
    key: 'slaBreach',
    label: 'SLA Breach Notifications',
    description: 'Notify when alerts exceed SLA thresholds',
  },
  {
    key: 'queueAssignment',
    label: 'Queue Assignment Notifications',
    description: 'Notify when alerts are assigned to a queue',
  },
  {
    key: 'caseEscalation',
    label: 'Case Escalation Notifications',
    description: 'Notify when cases are escalated for review',
  },
];

export function NotificationSettingsTab({ isReadOnly }: NotificationSettingsTabProps) {
  const [settings, setSettings] = useState(mockPlatformSettings.notifications);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleToggle = (type: NotificationType, enabled: boolean) => {
    setSettings({
      ...settings,
      [type]: { ...settings[type], enabled },
    });
  };

  const handleChannelToggle = (type: NotificationType, channel: NotificationChannel) => {
    const currentChannels = settings[type].channels;
    let newChannels: NotificationChannel[];

    if (currentChannels.includes(channel)) {
      // Don't allow removing the last channel
      if (currentChannels.length === 1) {
        toast.error('At least one channel must be selected');
        return;
      }
      newChannels = currentChannels.filter((c) => c !== channel);
    } else {
      newChannels = [...currentChannels, channel];
    }

    setSettings({
      ...settings,
      [type]: { ...settings[type], channels: newChannels },
    });
  };

  const handleSave = () => {
    setShowConfirmDialog(true);
  };

  const confirmSave = () => {
    toast.success('Notification settings saved successfully');
    setShowConfirmDialog(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Configure which notifications are sent and through which channels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {notificationConfig.map((config) => (
            <div
              key={config.key}
              className="p-4 border rounded-lg space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">{config.label}</Label>
                  <p className="text-sm text-muted-foreground">{config.description}</p>
                </div>
                <Switch
                  checked={settings[config.key].enabled}
                  onCheckedChange={(checked) => handleToggle(config.key, checked)}
                  disabled={isReadOnly}
                />
              </div>

              {settings[config.key].enabled && (
                <div className="pl-4 border-l-2 border-muted">
                  <Label className="text-sm text-muted-foreground mb-2 block">
                    Delivery Channels:
                  </Label>
                  <div className="flex gap-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`${config.key}-in_app`}
                        checked={settings[config.key].channels.includes('in_app')}
                        onCheckedChange={() => handleChannelToggle(config.key, 'in_app')}
                        disabled={isReadOnly}
                      />
                      <label
                        htmlFor={`${config.key}-in_app`}
                        className="flex items-center gap-1.5 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        <Monitor className="h-3.5 w-3.5" />
                        In-App
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`${config.key}-email`}
                        checked={settings[config.key].channels.includes('email')}
                        onCheckedChange={() => handleChannelToggle(config.key, 'email')}
                        disabled={isReadOnly}
                      />
                      <label
                        htmlFor={`${config.key}-email`}
                        className="flex items-center gap-1.5 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        Email
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

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
            <AlertDialogTitle>Confirm Notification Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to update notification settings. 
              These changes will affect how and when users receive alerts.
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
