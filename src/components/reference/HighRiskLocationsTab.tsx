import React, { useState } from 'react';
import { Search, Plus, Pencil, ToggleRight, ToggleLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { useHighRiskLocations, useMutateLocation } from '@/hooks/useReferenceData';
import type { HighRiskLocation } from '@/services/reference-data.service';

const RISK_BADGE: Record<string, string> = {
  HIGH: 'bg-[hsl(var(--risk-high))] text-[hsl(var(--risk-high-foreground))]',
  MEDIUM: 'bg-[hsl(var(--risk-medium))] text-[hsl(var(--risk-medium-foreground))]',
  LOW: 'bg-[hsl(var(--risk-low))] text-[hsl(var(--risk-low-foreground))]',
};

const TYPE_BADGE: Record<string, string> = {
  BORDER: 'bg-[hsl(var(--primary))]/15 text-[hsl(var(--primary))] border-[hsl(var(--primary))]/30',
  CASH_INTENSIVE: 'bg-[hsl(var(--risk-medium))]/15 text-[hsl(var(--risk-medium))] border-[hsl(var(--risk-medium))]/30',
  HIGH_CRIME: 'bg-[hsl(var(--risk-high))]/15 text-[hsl(var(--risk-high))] border-[hsl(var(--risk-high))]/30',
};

const emptyForm: Partial<HighRiskLocation> = {
  location_name: '', state: '', country_code: 'IND', location_type: 'BORDER', risk_level: 'HIGH', risk_score: 50, reason: '', is_active: true,
};

export default function HighRiskLocationsTab() {
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [activeOnly, setActiveOnly] = useState(true);
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState<Partial<HighRiskLocation>>(emptyForm);
  const [editMode, setEditMode] = useState(false);

  const params: any = {};
  if (typeFilter !== 'ALL') params.location_type = typeFilter;
  if (riskFilter !== 'ALL') params.risk_level = riskFilter;
  if (activeOnly) params.is_active = true;
  else params.is_active = '';

  const { data: locations = [], isLoading } = useHighRiskLocations(params);
  const { create, update, deactivate } = useMutateLocation();

  const filtered = (locations as HighRiskLocation[]).filter((l) => {
    // active filtering handled server-side
    if (!search) return true;
    const s = search.toLowerCase();
    return l.location_name?.toLowerCase().includes(s) || l.state?.toLowerCase().includes(s);
  });

  const openAdd = () => { setForm({ ...emptyForm }); setEditMode(false); setSheetOpen(true); };
  const openEdit = (l: HighRiskLocation) => { setForm({ ...l }); setEditMode(true); setSheetOpen(true); };

  const handleSave = async () => {
    try {
      if (editMode) {
        await update.mutateAsync({ id: form.id!, data: form });
        toast.success('Location updated');
      } else {
        await create.mutateAsync(form);
        toast.success('Location added');
      }
      setSheetOpen(false);
    } catch { toast.error('Failed to save'); }
  };

  const handleDeactivate = async (id: string) => {
    try { await deactivate.mutateAsync(id); toast.success('Location deactivated'); }
    catch { toast.error('Failed to deactivate'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue placeholder="Location Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="BORDER">Border</SelectItem>
            <SelectItem value="CASH_INTENSIVE">Cash Intensive</SelectItem>
            <SelectItem value="HIGH_CRIME">High Crime</SelectItem>
          </SelectContent>
        </Select>
        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Risk Level" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Levels</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Switch checked={activeOnly} onCheckedChange={setActiveOnly} id="active-loc" />
          <Label htmlFor="active-loc" className="text-xs text-muted-foreground">Active Only</Label>
        </div>
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search location..." className="pl-8 h-8 text-xs" />
        </div>
        <Button size="sm" className="ml-auto h-8 text-xs" onClick={openAdd}><Plus className="h-3.5 w-3.5 mr-1" />Add New</Button>
      </div>

      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-xs">Location</TableHead>
              <TableHead className="text-xs">State</TableHead>
              <TableHead className="text-xs">Type</TableHead>
              <TableHead className="text-xs">Risk Level</TableHead>
              <TableHead className="text-xs">Risk Score</TableHead>
              <TableHead className="text-xs">Reason</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>{Array.from({ length: 8 }).map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}</TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-sm">No records found</TableCell></TableRow>
            ) : (
              filtered.map((l) => (
                <TableRow key={l.id} className="text-xs">
                  <TableCell>{l.location_name}</TableCell>
                  <TableCell>{l.state}</TableCell>
                  <TableCell><Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${TYPE_BADGE[l.location_type] || ''}`}>{l.location_type?.replace('_', ' ')}</Badge></TableCell>
                  <TableCell><Badge className={`${RISK_BADGE[l.risk_level]} text-[10px] px-1.5 py-0`}>{l.risk_level}</Badge></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">{l.risk_score}</span>
                      <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${l.risk_score}%` }} /></div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[160px] truncate">{l.reason || '—'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${l.is_active ? 'border-[hsl(var(--risk-low))] text-[hsl(var(--risk-low))]' : 'border-muted-foreground text-muted-foreground'}`}>
                      {l.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEdit(l)}><Pencil className="h-3 w-3" /></Button>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeactivate(l.id)}>
                            {l.is_active ? <ToggleRight className="h-3.5 w-3.5 text-[hsl(var(--risk-low))]" /> : <ToggleLeft className="h-3.5 w-3.5 text-muted-foreground" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p className="text-xs">Deactivate this entry?</p></TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-[10px] text-muted-foreground">Showing {filtered.length} of {filtered.length}</p>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader><SheetTitle className="text-sm">{editMode ? 'Edit Location' : 'Add High-Risk Location'}</SheetTitle></SheetHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Location Name</Label>
              <Input value={form.location_name || ''} onChange={(e) => setForm({ ...form, location_name: e.target.value })} className="h-8 text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">State</Label>
              <Input value={form.state || ''} onChange={(e) => setForm({ ...form, state: e.target.value })} className="h-8 text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Country Code</Label>
              <Input value="IND" disabled className="h-8 text-xs font-mono bg-muted" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Location Type</Label>
              <Select value={form.location_type} onValueChange={(v: any) => setForm({ ...form, location_type: v })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BORDER">Border</SelectItem>
                  <SelectItem value="CASH_INTENSIVE">Cash Intensive</SelectItem>
                  <SelectItem value="HIGH_CRIME">High Crime</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Risk Level</Label>
              <Select value={form.risk_level} onValueChange={(v: any) => setForm({ ...form, risk_level: v })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Risk Score: {form.risk_score}</Label>
              <Slider value={[form.risk_score || 50]} onValueChange={([v]) => setForm({ ...form, risk_score: v })} max={100} step={1} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Reason</Label>
              <Textarea value={form.reason || ''} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="text-xs min-h-[60px]" />
            </div>
          </div>
          <SheetFooter>
            <Button size="sm" className="text-xs" onClick={handleSave} disabled={create.isPending || update.isPending}>
              {(create.isPending || update.isPending) ? 'Saving…' : 'Save'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
