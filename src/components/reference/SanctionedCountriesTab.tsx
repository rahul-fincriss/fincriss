import React, { useState } from 'react';
import { Search, Plus, Pencil, ToggleRight, ToggleLeft } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { useSanctionedCountries, useMutateSanctioned } from '@/hooks/useReferenceData';
import type { SanctionedCountry } from '@/services/reference-data.service';

const PROGRAM_BADGE: Record<string, string> = {
  OFAC: 'bg-[hsl(var(--risk-high))] text-white',
  UN: 'bg-[hsl(var(--primary))] text-white',
  EU: 'bg-indigo-600 text-white',
  FATF: 'bg-[hsl(var(--risk-medium))] text-white',
};

const SANCTION_TYPE_STYLE: Record<string, string> = {
  COMPREHENSIVE: 'bg-[hsl(var(--risk-high))]/15 text-[hsl(var(--risk-high))] border-[hsl(var(--risk-high))]/40',
  TARGETED: 'bg-[hsl(var(--risk-medium))]/15 text-[hsl(var(--risk-medium))] border-[hsl(var(--risk-medium))]/40',
  SECTORAL: 'bg-muted text-muted-foreground border-border',
};

const emptyForm: Partial<SanctionedCountry> & { effective_date_obj?: Date; expiry_date_obj?: Date } = {
  country_code: '', country_name: '', program: 'OFAC', sanction_type: 'COMPREHENSIVE', effective_date: '', expiry_date: null, description: '', is_active: true,
};

export default function SanctionedCountriesTab() {
  const [programFilter, setProgramFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [activeOnly, setActiveOnly] = useState(true);
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState<any>(emptyForm);
  const [editMode, setEditMode] = useState(false);

  const params: any = {};
  if (programFilter !== 'ALL') params.program = programFilter;
  if (typeFilter !== 'ALL') params.sanction_type = typeFilter;
  if (activeOnly) params.is_active = true;

  const { data: countries = [], isLoading } = useSanctionedCountries(params);
  const { create, update, deactivate } = useMutateSanctioned();

  const filtered = (countries as SanctionedCountry[]).filter((c) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return c.country_name?.toLowerCase().includes(s) || c.country_code?.toLowerCase().includes(s);
  });

  const openAdd = () => { setForm({ ...emptyForm }); setEditMode(false); setSheetOpen(true); };
  const openEdit = (c: SanctionedCountry) => {
    setForm({
      ...c,
      effective_date_obj: c.effective_date ? new Date(c.effective_date) : undefined,
      expiry_date_obj: c.expiry_date ? new Date(c.expiry_date) : undefined,
    });
    setEditMode(true);
    setSheetOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      ...form,
      effective_date: form.effective_date_obj ? form.effective_date_obj.toISOString().split('T')[0] : form.effective_date,
      expiry_date: form.expiry_date_obj ? form.expiry_date_obj.toISOString().split('T')[0] : form.expiry_date,
    };
    delete payload.effective_date_obj;
    delete payload.expiry_date_obj;
    try {
      if (editMode) {
        await update.mutateAsync({ code: form.country_code!, data: payload });
        toast.success('Sanctioned country updated');
      } else {
        await create.mutateAsync(payload);
        toast.success('Sanctioned country added');
      }
      setSheetOpen(false);
    } catch { toast.error('Failed to save'); }
  };

  const handleDeactivate = async (code: string) => {
    try { await deactivate.mutateAsync(code); toast.success('Entry deactivated'); }
    catch { toast.error('Failed to deactivate'); }
  };

  const getExpiryDisplay = (expiry: string | null) => {
    if (!expiry) return <span className="text-muted-foreground text-xs">Ongoing</span>;
    const d = new Date(expiry);
    if (d < new Date()) return <span className="text-[hsl(var(--risk-high))] text-xs">Expired</span>;
    return <span className="text-xs">{d.toLocaleDateString()}</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={programFilter} onValueChange={setProgramFilter}>
          <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Program" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Programs</SelectItem>
            <SelectItem value="OFAC">OFAC</SelectItem>
            <SelectItem value="UN">UN</SelectItem>
            <SelectItem value="EU">EU</SelectItem>
            <SelectItem value="FATF">FATF</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue placeholder="Sanction Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="COMPREHENSIVE">Comprehensive</SelectItem>
            <SelectItem value="TARGETED">Targeted</SelectItem>
            <SelectItem value="SECTORAL">Sectoral</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Switch checked={activeOnly} onCheckedChange={setActiveOnly} id="active-sanc" />
          <Label htmlFor="active-sanc" className="text-xs text-muted-foreground">Active Only</Label>
        </div>
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search country..." className="pl-8 h-8 text-xs" />
        </div>
        <Button size="sm" className="ml-auto h-8 text-xs" onClick={openAdd}><Plus className="h-3.5 w-3.5 mr-1" />Add New</Button>
      </div>

      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-xs">Code</TableHead>
              <TableHead className="text-xs">Country</TableHead>
              <TableHead className="text-xs">Program</TableHead>
              <TableHead className="text-xs">Type</TableHead>
              <TableHead className="text-xs">Effective</TableHead>
              <TableHead className="text-xs">Expiry</TableHead>
              <TableHead className="text-xs">Description</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs w-[80px]">Actions</TableHead>
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
              filtered.map((c) => (
                <TableRow key={`${c.country_code}-${c.program}`} className="text-xs">
                  <TableCell className="font-mono">{c.country_code}</TableCell>
                  <TableCell>{c.country_name}</TableCell>
                  <TableCell><Badge className={`${PROGRAM_BADGE[c.program]} text-[10px] px-1.5 py-0`}>{c.program}</Badge></TableCell>
                  <TableCell><Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${SANCTION_TYPE_STYLE[c.sanction_type] || ''}`}>{c.sanction_type}</Badge></TableCell>
                  <TableCell>{c.effective_date ? new Date(c.effective_date).toLocaleDateString() : '—'}</TableCell>
                  <TableCell>{getExpiryDisplay(c.expiry_date)}</TableCell>
                  <TableCell className="max-w-[160px] truncate">{c.description || '—'}</TableCell>
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

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader><SheetTitle className="text-sm">{editMode ? 'Edit Sanctioned Country' : 'Add Sanctioned Country'}</SheetTitle></SheetHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Country Code (ISO 3-letter)</Label>
              <Input value={form.country_code || ''} onChange={(e) => setForm({ ...form, country_code: e.target.value.toUpperCase().slice(0, 3) })} disabled={editMode} className="h-8 text-xs font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Country Name</Label>
              <Input value={form.country_name || ''} onChange={(e) => setForm({ ...form, country_name: e.target.value })} className="h-8 text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Sanction Program</Label>
              <Select value={form.program} onValueChange={(v: any) => setForm({ ...form, program: v })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="OFAC">OFAC</SelectItem>
                  <SelectItem value="UN">UN</SelectItem>
                  <SelectItem value="EU">EU</SelectItem>
                  <SelectItem value="FATF">FATF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Sanction Type</Label>
              <Select value={form.sanction_type} onValueChange={(v: any) => setForm({ ...form, sanction_type: v })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMPREHENSIVE">Comprehensive</SelectItem>
                  <SelectItem value="TARGETED">Targeted</SelectItem>
                  <SelectItem value="SECTORAL">Sectoral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Effective Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full h-8 justify-start text-left text-xs font-normal", !form.effective_date_obj && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                    {form.effective_date_obj ? format(form.effective_date_obj, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={form.effective_date_obj} onSelect={(d) => setForm({ ...form, effective_date_obj: d })} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Expiry Date (optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full h-8 justify-start text-left text-xs font-normal", !form.expiry_date_obj && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                    {form.expiry_date_obj ? format(form.expiry_date_obj, 'PPP') : 'No expiry'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={form.expiry_date_obj} onSelect={(d) => setForm({ ...form, expiry_date_obj: d })} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} className="text-xs min-h-[60px]" />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: !!v })} id="active-sanc-form" />
              <Label htmlFor="active-sanc-form" className="text-xs">Active</Label>
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
