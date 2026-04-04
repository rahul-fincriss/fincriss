import React, { useState } from 'react';
import { Search, Plus, Pencil, Flame } from 'lucide-react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useIndustryRisks, useMutateIndustry } from '@/hooks/useReferenceData';
import type { IndustryRisk } from '@/services/reference-data.service';

const RISK_BADGE: Record<string, string> = {
  CRITICAL: 'bg-purple-600 text-white',
  HIGH: 'bg-[hsl(var(--risk-high))] text-[hsl(var(--risk-high-foreground))]',
  MEDIUM: 'bg-[hsl(var(--risk-medium))] text-[hsl(var(--risk-medium-foreground))]',
  LOW: 'bg-[hsl(var(--risk-low))] text-[hsl(var(--risk-low-foreground))]',
};

const emptyForm: Partial<IndustryRisk> = {
  industry_code: '', industry_name: '', risk_level: 'MEDIUM', risk_score: 50, cash_intensive: false, reason: '', regulatory_notes: '',
};

export default function IndustryRiskTab() {
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [cashOnly, setCashOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState<Partial<IndustryRisk>>(emptyForm);
  const [editMode, setEditMode] = useState(false);

  const params: any = {};
  if (riskFilter !== 'ALL') params.risk_level = riskFilter;
  if (cashOnly) params.cash_intensive = true;

  const { data: industries = [], isLoading } = useIndustryRisks(params);
  const { create, update } = useMutateIndustry();

  const filtered = (industries as IndustryRisk[]).filter((i) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return i.industry_name?.toLowerCase().includes(s) || i.industry_code?.toLowerCase().includes(s);
  });

  const openAdd = () => { setForm({ ...emptyForm }); setEditMode(false); setSheetOpen(true); };
  const openEdit = (i: IndustryRisk) => { setForm({ ...i }); setEditMode(true); setSheetOpen(true); };

  const handleSave = async () => {
    try {
      if (editMode) {
        await update.mutateAsync({ code: form.industry_code!, data: form });
        toast.success('Industry updated');
      } else {
        await create.mutateAsync(form);
        toast.success('Industry added');
      }
      setSheetOpen(false);
    } catch { toast.error('Failed to save'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Risk Level" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Levels</SelectItem>
            <SelectItem value="CRITICAL">Critical</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Switch checked={cashOnly} onCheckedChange={setCashOnly} id="cash-only" />
          <Label htmlFor="cash-only" className="text-xs text-muted-foreground">Cash Intensive Only</Label>
        </div>
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search industry..." className="pl-8 h-8 text-xs" />
        </div>
        <Button size="sm" className="ml-auto h-8 text-xs" onClick={openAdd}><Plus className="h-3.5 w-3.5 mr-1" />Add New</Button>
      </div>

      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-xs">Code</TableHead>
              <TableHead className="text-xs">Industry Name</TableHead>
              <TableHead className="text-xs">Risk Level</TableHead>
              <TableHead className="text-xs">Risk Score</TableHead>
              <TableHead className="text-xs">Cash Intensive</TableHead>
              <TableHead className="text-xs">Reason</TableHead>
              <TableHead className="text-xs">Regulatory Notes</TableHead>
              <TableHead className="text-xs">Last Updated</TableHead>
              <TableHead className="text-xs w-[60px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>{Array.from({ length: 9 }).map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}</TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center py-12 text-muted-foreground text-sm">No records found</TableCell></TableRow>
            ) : (
              filtered.map((i) => (
                <TableRow key={i.industry_code} className="text-xs">
                  <TableCell className="font-mono">{i.industry_code}</TableCell>
                  <TableCell>{i.industry_name}</TableCell>
                  <TableCell><Badge className={`${RISK_BADGE[i.risk_level]} text-[10px] px-1.5 py-0`}>{i.risk_level}</Badge></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">{i.risk_score}</span>
                      <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${i.risk_score}%` }} /></div>
                    </div>
                  </TableCell>
                  <TableCell>{i.cash_intensive ? <Flame className="h-3.5 w-3.5 text-[hsl(var(--risk-medium))]" /> : <span className="text-muted-foreground">—</span>}</TableCell>
                  <TableCell className="max-w-[140px] truncate">{i.reason || '—'}</TableCell>
                  <TableCell className="max-w-[140px] truncate">{i.regulatory_notes || '—'}</TableCell>
                  <TableCell>{i.last_updated ? new Date(i.last_updated).toLocaleDateString() : '—'}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEdit(i)}><Pencil className="h-3 w-3" /></Button>
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
          <SheetHeader><SheetTitle className="text-sm">{editMode ? 'Edit Industry' : 'Add Industry Risk'}</SheetTitle></SheetHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Industry Code</Label>
              <Input value={form.industry_code || ''} onChange={(e) => setForm({ ...form, industry_code: e.target.value.slice(0, 20) })} disabled={editMode} className="h-8 text-xs font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Industry Name</Label>
              <Input value={form.industry_name || ''} onChange={(e) => setForm({ ...form, industry_name: e.target.value })} className="h-8 text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Risk Level</Label>
              <Select value={form.risk_level} onValueChange={(v: any) => setForm({ ...form, risk_level: v })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
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
            <div className="flex items-center gap-2">
              <Switch checked={form.cash_intensive || false} onCheckedChange={(v) => setForm({ ...form, cash_intensive: v })} id="cash-toggle" />
              <Label htmlFor="cash-toggle" className="text-xs">Cash Intensive</Label>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Reason</Label>
              <Textarea value={form.reason || ''} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="text-xs min-h-[60px]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Regulatory Notes</Label>
              <Textarea value={form.regulatory_notes || ''} onChange={(e) => setForm({ ...form, regulatory_notes: e.target.value })} className="text-xs min-h-[60px]" />
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
