import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { Badge } from '@/components/ui/badge';
import { Lock, Save } from 'lucide-react';
import { toast } from 'sonner';
import { mockPlatformSettings } from '@/data/adminMockData';
import { TimeZoneOption, DateFormatOption, CurrencyOption } from '@/types/admin';

interface GeneralSettingsTabProps {
  isReadOnly: boolean;
}

export function GeneralSettingsTab({ isReadOnly }: GeneralSettingsTabProps) {
  const [settings, setSettings] = useState(mockPlatformSettings.general);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<typeof settings | null>(null);

  const handleSave = () => {
    setPendingChanges(settings);
    setShowConfirmDialog(true);
  };

  const confirmSave = () => {
    // In production, this would save to backend
    toast.success('General settings saved successfully');
    setShowConfirmDialog(false);
    setPendingChanges(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Configure platform-wide display and localization preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Read-only fields */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Platform Name</Label>
                <Lock className="h-3 w-3 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-2">
                <Input value={settings.platformName} disabled className="bg-muted" />
                <Badge variant="secondary">System</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Platform name cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Default Theme</Label>
                <Lock className="h-3 w-3 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-2">
                <Input value="Light" disabled className="bg-muted" />
                <Badge variant="secondary">System</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Theme is controlled at user level
              </p>
            </div>
          </div>

          {/* Editable fields */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="timeZone">Time Zone</Label>
              <Select
                value={settings.timeZone}
                onValueChange={(value: TimeZoneOption) =>
                  setSettings({ ...settings, timeZone: value })
                }
                disabled={isReadOnly}
              >
                <SelectTrigger id="timeZone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Default timezone for all timestamps
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select
                value={settings.dateFormat}
                onValueChange={(value: DateFormatOption) =>
                  setSettings({ ...settings, dateFormat: value })
                }
                disabled={isReadOnly}
              >
                <SelectTrigger id="dateFormat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Format used throughout the platform
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency Display</Label>
              <Select
                value={settings.currency}
                onValueChange={(value: CurrencyOption) =>
                  setSettings({ ...settings, currency: value })
                }
                disabled={isReadOnly}
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">₹ Indian Rupee (INR)</SelectItem>
                  <SelectItem value="USD">$ US Dollar (USD)</SelectItem>
                  <SelectItem value="EUR">€ Euro (EUR)</SelectItem>
                  <SelectItem value="GBP">£ British Pound (GBP)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Default currency for monetary values
              </p>
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
            <AlertDialogTitle>Confirm Settings Change</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to update general platform settings. These changes will affect all users.
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
