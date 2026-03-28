import { useState } from "react";
import { RESOLVED_RISKS } from "../../data/referenceData";
import SectionHeader from "../ui/SectionHeader";

export default function ResolvedRisksSection() {
  const [open, setOpen] = useState(null);
  return (
    <div style={{ padding: "20px 24px 32px" }}>
      <SectionHeader title="Resolved Risks" subtitle="How each risk was addressed — click to see full resolution strategy" icon={"\uD83D\uDEE1\uFE0F"} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
        {RESOLVED_RISKS.map((r, i) => (
          <div key={i} onClick={() => setOpen(open === i ? null : i)} style={{ background: "var(--card-bg)", border: "1.5px solid #86EFAC", borderRadius: 12, padding: "14px 16px", cursor: "pointer", boxShadow: open === i ? "0 4px 20px rgba(0,0,0,0.08)" : "0 1px 4px rgba(0,0,0,0.04)", transition: "all 0.2s", borderLeft: "4px solid #22C55E" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: "var(--card-text)", flex: 1 }}>{r.risk}</span>
              <span style={{ fontSize: 10, fontWeight: 800, background: "#DCFCE7", color: "#15803D", padding: "2px 8px", borderRadius: 20, marginLeft: 8, flexShrink: 0 }}>{"\u2713"} {r.status}</span>
            </div>
            {open === i ? (
              <div style={{ marginTop: 8 }}>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#EF4444", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>Was</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6, background: "#FEF2F2", padding: "8px 10px", borderRadius: 6 }}>{r.was}</div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#22C55E", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>Resolution</div>
                  <div style={{ fontSize: 12, color: "var(--card-text)", lineHeight: 1.6, background: "#F0FDF4", padding: "8px 10px", borderRadius: 6 }}>{r.resolution}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>Tasks</div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {r.tasks.map(t => <span key={t} style={{ background: "#F1F5F9", border: "1px solid #E2E8F0", borderRadius: 4, padding: "1px 6px", fontSize: 10, fontWeight: 600, color: "#64748B", fontFamily: "monospace" }}>{t}</span>)}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 12, color: "#22C55E", fontWeight: 500 }}>{"\u21B3"} {r.resolution.slice(0, 80)}{"\u2026"}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
