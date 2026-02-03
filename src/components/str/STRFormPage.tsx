import { ReactNode } from 'react';

interface STRFormPageProps {
  pageNumber: number;
  pageCode: string;
  children: ReactNode;
}

export function STRFormPage({ pageNumber, pageCode, children }: STRFormPageProps) {
  return (
    <div className="str-form-page bg-white text-black border border-gray-300 p-8 min-h-[1056px] relative font-mono text-sm">
      {/* Header */}
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="font-bold text-base">FIU‑IND</span>
          <span className="text-xs">Financial Intelligence Unit‑ India</span>
        </div>
        <h1 className="text-base font-bold uppercase tracking-wide">
          SUSPICIOUS TRANSACTION REPORT (STR) FOR A BANKING COMPANY
        </h1>
        <p className="text-xs mt-2 italic text-gray-600">
          Kindly fill in CAPITAL. Read the instructions before filling the form.
        </p>
      </div>

      {/* Content */}
      <div className="space-y-6 print:break-inside-avoid">
        {children}
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 px-8 flex items-center justify-between text-xs border-t border-gray-300 pt-2">
        <span className="text-gray-400">DO NOT FILL. FOR FIU‑IND USE ONLY.</span>
        <span className="font-bold">{pageCode}</span>
      </div>

      {/* Page indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-400">
        Page {pageNumber}
      </div>
    </div>
  );
}

interface FormFieldProps {
  number?: string;
  label: string;
  value?: string;
  className?: string;
  multiline?: boolean;
  rows?: number;
}

export function FormField({ number, label, value = '', className = '', multiline = false, rows = 1 }: FormFieldProps) {
  return (
    <div className={`grid grid-cols-[120px_1fr] gap-2 ${className}`}>
      <label className="text-xs font-medium">
        {number && <span className="font-bold mr-1">{number}</span>}
        {label}
      </label>
      <div className={`border border-gray-400 bg-gray-50 px-2 py-1 ${multiline ? `min-h-[${rows * 24}px]` : 'h-6'} text-xs uppercase`}>
        {value}
      </div>
    </div>
  );
}

interface FormFieldInlineProps {
  number?: string;
  label: string;
  value?: string;
  width?: string;
}

export function FormFieldInline({ number, label, value = '', width = 'auto' }: FormFieldInlineProps) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {number && <span className="font-bold">{number}</span>}
      <span className="font-medium">{label}</span>
      <div className={`border border-gray-400 bg-gray-50 px-2 h-6 flex items-center uppercase ${width === 'auto' ? 'flex-1' : `w-[${width}]`}`}>
        {value}
      </div>
    </div>
  );
}

interface PartHeaderProps {
  partNumber: number;
  title: string;
}

export function PartHeader({ partNumber, title }: PartHeaderProps) {
  return (
    <div className="bg-gray-200 border-2 border-black px-3 py-2 font-bold text-sm uppercase tracking-wide">
      PART {partNumber} {title}
    </div>
  );
}

interface FormBoxProps {
  number?: string;
  label?: string;
  value?: string;
  lines?: number;
  children?: ReactNode;
}

export function FormBox({ number, label, value = '', lines = 1, children }: FormBoxProps) {
  const minHeight = lines * 24;
  return (
    <div className="space-y-1">
      {(number || label) && (
        <div className="text-xs font-medium flex gap-1">
          {number && <span className="font-bold">{number}</span>}
          {label && <span>{label}</span>}
        </div>
      )}
      {children ? (
        children
      ) : (
        <div 
          className="border border-gray-400 bg-gray-50 px-2 py-1 text-xs whitespace-pre-wrap uppercase"
          style={{ minHeight: `${minHeight}px` }}
        >
          {value}
        </div>
      )}
    </div>
  );
}

interface CheckboxFieldProps {
  label: string;
  checked?: boolean;
}

export function CheckboxField({ label, checked = false }: CheckboxFieldProps) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <div className={`w-4 h-4 border border-gray-400 flex items-center justify-center ${checked ? 'bg-gray-200' : 'bg-white'}`}>
        {checked && <span className="text-xs font-bold">✓</span>}
      </div>
      <span>{label}</span>
    </div>
  );
}

interface TableRowData {
  cells: (string | undefined)[];
}

interface FormTableProps {
  headers: string[];
  rows: TableRowData[];
  columnWidths?: string[];
}

export function FormTable({ headers, rows, columnWidths }: FormTableProps) {
  return (
    <table className="w-full border-collapse text-xs">
      <thead>
        <tr>
          {headers.map((header, i) => (
            <th 
              key={i} 
              className="border border-gray-400 bg-gray-100 px-2 py-1 text-left font-medium"
              style={columnWidths?.[i] ? { width: columnWidths[i] } : undefined}
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.cells.map((cell, cellIndex) => (
              <td key={cellIndex} className="border border-gray-400 px-2 py-1 uppercase">
                {cell || ''}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

interface NumberedListProps {
  items: string[];
  startNumber?: number;
}

export function NumberedList({ items, startNumber = 1 }: NumberedListProps) {
  return (
    <div className="space-y-1">
      {items.map((item, index) => (
        <div key={index} className="grid grid-cols-[30px_1fr] gap-2 text-xs">
          <span className="font-bold text-right">{startNumber + index}.</span>
          <div className="border border-gray-400 bg-gray-50 px-2 py-1 min-h-[24px] uppercase">
            {item}
          </div>
        </div>
      ))}
    </div>
  );
}
