import React, { useState } from 'react';
import { Search, Plus, Pencil, ToggleRight, ToggleLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { useHighRiskCountries, useMutateCountry } from '@/hooks/useReferenceData';
import type { HighRiskCountry } from '@/services/reference-data.service';

const RISK_BADGE: Record<string, string> = {
  HIGH: 'bg-[hsl(var(--risk-high))] text-[hsl(var(--risk-high-foreground))]',
  MEDIUM: 'bg-[hsl(var(--risk-medium))] text-[hsl(var(--risk-medium-foreground))]',
  LOW: 'bg-[hsl(var(--risk-low))] text-[hsl(var(--risk-low-foreground))]',
};

const emptyForm: Partial<HighRiskCountry> = {
  country_code: '', country_name: '', risk_level: 'HIGH', risk_score: 50, reason: '', is_active: true,
};

export default function HighRiskCountriesTab() {
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [activeOnly, setActiveOnly] = useState(true);
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState<Partial<HighRiskCountry>>(emptyForm);
  const [editMode, setEditMode] = useState(false);

  const params: any = {};
  if (riskFilter !== 'ALL') params.risk_level = riskFilter;
  if (activeOnly) params.is_active = true;
  else params.is_active = '';
  if (search) params.search = search;

  const { data: countries = [], isLoading } = useHighRiskCountries(params);
  const { create, update, deactivate } = useMutateCountry();

  const filtered = (countries as HighRiskCountry[]).filter((c) => {
    // active filtering handled server-side
    if (!search) return true;
    const s = search.toLowerCase();
    return c.country_name?.toLowerCase().includes(s) || c.country_code?.toLowerCase().includes(s);
  });

  const openAdd = () => { setForm({ ...emptyForm }); setEditMode(false); setSheetOpen(true); };
  const openEdit = (c: HighRiskCountry) => { setForm({ ...c }); setEditMode(true); setSheetOpen(true); };

  const handleSave = async () => {
    try {
      if (editMode) {
        await update.mutateAsync({ code: form.country_code!, data: form });
        toast.success('Country updated');
      } else {
        await create.mutateAsync(form);
        toast.success('Country added');
      }
      setSheetOpen(false);
    } catch {
      toast.error('Failed to save');
    }
  };

  const handleDeactivate = async (code: string) => {
    try {
      await deactivate.mutateAsync(code);
      toast.success('Country deactivated');
    } catch {
      toast.error('Failed to deactivate');
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
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
          <Switch checked={activeOnly} onCheckedChange={setActiveOnly} id="active-countries" />
          <Label htmlFor="active-countries" className="text-xs text-muted-foreground">Active Only</Label>
        </div>
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search country..." className="pl-8 h-8 text-xs" />
        </div>
        <Button size="sm" className="ml-auto h-8 text-xs" onClick={openAdd}><Plus className="h-3.5 w-3.5 mr-1" />Add New</Button>
      </div>

      {/* Table */}
      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-xs">Code</TableHead>
              <TableHead className="text-xs">Country Name</TableHead>
              <TableHead className="text-xs">Risk Level</TableHead>
              <TableHead className="text-xs">Risk Score</TableHead>
              <TableHead className="text-xs">Reason</TableHead>
              <TableHead className="text-xs">Added Date</TableHead>
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
              filtered.map((c) => (
                <TableRow key={c.country_code} className="text-xs">
                  <TableCell className="font-mono">{c.country_code}</TableCell>
                  <TableCell>{c.country_name}</TableCell>
                  <TableCell><Badge className={`${RISK_BADGE[c.risk_level]} text-[10px] px-1.5 py-0`}>{c.risk_level}</Badge></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">{c.risk_score}</span>
                      <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${c.risk_score}%` }} />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate">{c.reason || '—'}</TableCell>
                  <TableCell>{c.added_date ? new Date(c.added_date).toLocaleDateString() : '—'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${c.is_active ? 'border-[hsl(var(--risk-low))] text-[hsl(var(--risk-low))]' : 'border-muted-foreground text-muted-foreground'}`}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEdit(c)}><Pencil className="h-3 w-3" /></Button>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeactivate(c.country_code)}>
                            {c.is_active ? <ToggleRight className="h-3.5 w-3.5 text-[hsl(var(--risk-low))]" /> : <ToggleLeft className="h-3.5 w-3.5 text-muted-foreground" />}
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

      {/* Slide-over */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader><SheetTitle className="text-sm">{editMode ? 'Edit Country' : 'Add High-Risk Country'}</SheetTitle></SheetHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Country Code (ISO 3-letter)</Label>
              <Input value={form.country_code || ''} onChange={(e) => setForm({ ...form, country_code: e.target.value.toUpperCase().slice(0, 3) })} disabled={editMode} className="h-8 text-xs font-mono" placeholder="e.g. IRN" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Country Name</Label>
              <Input value={form.country_name || ''} onChange={(e) => setForm({ ...form, country_name: e.target.value })} className="h-8 text-xs" />
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
            <div className="flex items-center gap-2">
              <Checkbox checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: !!v })} id="active-check" />
              <Label htmlFor="active-check" className="text-xs">Active</Label>
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
