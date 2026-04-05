import { useCallback, useEffect, useRef } from 'react';
import { Customer360Profile } from '@/services/customer360.service';
import { cn } from '@/lib/utils';

interface Props {
  profile: Customer360Profile;
  onSelectCustomer: (id: string) => void;
}

function riskColor(rating: string) {
  switch (rating?.toUpperCase()) {
    case 'CRITICAL': return '#ef4444';
    case 'HIGH': return '#ea580c';
    case 'MEDIUM': return '#f59e0b';
    case 'LOW': return '#22c55e';
    default: return '#94a3b8';
  }
}

function riskBadgeClass(rating: string) {
  switch (rating?.toUpperCase()) {
    case 'CRITICAL': return 'bg-risk-high text-white';
    case 'HIGH': return 'bg-orange-600 text-white';
    case 'MEDIUM': return 'bg-risk-medium text-risk-medium-foreground';
    case 'LOW': return 'bg-risk-low text-risk-low-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
}

function strengthColor(s: string) {
  switch (s?.toUpperCase()) {
    case 'HIGH': return 'text-risk-high';
    case 'MEDIUM': return 'text-risk-medium';
    case 'LOW': return 'text-risk-low';
    default: return 'text-muted-foreground';
  }
}

export function C360NetworkTab({ profile, onSelectCustomer }: Props) {
  const relationships = profile.relationships || [];
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simple force-directed graph visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || relationships.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width = canvas.offsetWidth * 2;
    const height = canvas.height = 400 * 2;
    canvas.style.height = '400px';
    ctx.scale(2, 2);

    const dw = canvas.offsetWidth;
    const dh = 400;
    const cx = dw / 2;
    const cy = dh / 2;

    // Nodes
    const nodes = [
      { id: profile.customer_id, name: profile.full_name, x: cx, y: cy, risk: profile.risk_rating, isCurrent: true },
      ...relationships.map((r, i) => {
        const angle = (2 * Math.PI * i) / relationships.length;
        const radius = Math.min(dw, dh) * 0.35;
        return {
          id: r.related_customer_id,
          name: r.related_customer_name,
          x: cx + radius * Math.cos(angle),
          y: cy + radius * Math.sin(angle),
          risk: r.risk_rating || 'LOW',
          isCurrent: false,
          type: r.relationship_type,
          strength: r.strength,
        };
      }),
    ];

    // Clear
    ctx.clearRect(0, 0, dw, dh);

    // Draw edges
    for (let i = 1; i < nodes.length; i++) {
      const n = nodes[i] as any;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(n.x, n.y);
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Edge label
      const mx = (cx + n.x) / 2;
      const my = (cy + n.y) / 2;
      ctx.font = '9px Inter, sans-serif';
      ctx.fillStyle = '#6b7280';
      ctx.textAlign = 'center';
      ctx.fillText(n.type || '', mx, my - 4);
    }

    // Draw nodes
    for (const n of nodes) {
      const r = n.isCurrent ? 20 : 14;
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fillStyle = n.isCurrent ? '#3b82f6' : riskColor(n.risk);
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Name
      ctx.font = `${n.isCurrent ? 'bold ' : ''}10px Inter, sans-serif`;
      ctx.fillStyle = '#e2e8f0';
      ctx.textAlign = 'center';
      ctx.fillText(n.name.length > 15 ? n.name.substring(0, 14) + '…' : n.name, n.x, n.y + r + 14);
    }

    // Legend
    const legendItems = [
      { label: 'LOW', color: '#22c55e' },
      { label: 'MEDIUM', color: '#f59e0b' },
      { label: 'HIGH', color: '#ea580c' },
      { label: 'CRITICAL', color: '#ef4444' },
      { label: 'Current', color: '#3b82f6' },
    ];
    let lx = 10;
    ctx.font = '9px Inter, sans-serif';
    for (const item of legendItems) {
      ctx.beginPath();
      ctx.arc(lx + 5, dh - 15, 5, 0, Math.PI * 2);
      ctx.fillStyle = item.color;
      ctx.fill();
      ctx.fillStyle = '#9ca3af';
      ctx.textAlign = 'left';
      ctx.fillText(item.label, lx + 14, dh - 12);
      lx += ctx.measureText(item.label).width + 28;
    }
  }, [profile, relationships]);

  return (
    <div className="space-y-4">
      {/* Graph */}
      <div className="panel-section">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Relationship Graph</h3>
        {relationships.length === 0 ? (
          <p className="text-xs text-muted-foreground py-8 text-center">No relationships found</p>
        ) : (
          <canvas ref={canvasRef} className="w-full rounded bg-muted/20" />
        )}
      </div>

      {/* Network Table */}
      <div className="panel-section">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Network Details</h3>
        {relationships.length === 0 ? (
          <p className="text-xs text-muted-foreground">No relationships</p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-[10px] text-muted-foreground uppercase">
                <th className="text-left py-1.5 font-medium">Related Customer</th>
                <th className="text-left py-1.5 font-medium">Relationship</th>
                <th className="text-left py-1.5 font-medium">Strength</th>
                <th className="text-left py-1.5 font-medium">Direction</th>
                <th className="text-left py-1.5 font-medium">Risk</th>
                <th className="text-left py-1.5 font-medium">Since</th>
              </tr>
            </thead>
            <tbody>
              {relationships.map((r, i) => (
                <tr
                  key={i}
                  className="border-b border-border/50 hover:bg-accent/30 cursor-pointer"
                  onClick={() => onSelectCustomer(r.related_customer_id)}
                >
                  <td className="py-1.5 text-primary">{r.related_customer_name}</td>
                  <td className="py-1.5">{r.relationship_type}</td>
                  <td className={cn('py-1.5 font-medium', strengthColor(r.strength))}>{r.strength}</td>
                  <td className="py-1.5">{r.direction}</td>
                  <td className="py-1.5">
                    {r.risk_rating && (
                      <span className={cn('px-1.5 py-0.5 text-[9px] font-bold rounded', riskBadgeClass(r.risk_rating))}>{r.risk_rating}</span>
                    )}
                  </td>
                  <td className="py-1.5">{r.since_date || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
