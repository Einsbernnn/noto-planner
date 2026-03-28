import { useState } from "react";
import { ADRS } from "../../data/referenceData";
import SectionHeader from "../ui/SectionHeader";

export default function ADRSection() {
  const [active, setActive] = useState(null);
  return (
    <div style={{ padding: "20px 24px 32px" }}>
      <SectionHeader title="Architecture Decision Records" subtitle="8 ADRs — click to expand. Includes Neon.tech, httpOnly Cookie, and Conflict Detection decisions." icon={"\uD83D\uDCCB"} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
        {ADRS.map(adr => (
          <div key={adr.id} onClick={() => setActive(active === adr.id ? null : adr.id)} style={{ background: "var(--card-bg)", border: "1px solid #E2E8F0", borderRadius: 12, padding: "14px 16px", cursor: "pointer", boxShadow: active === adr.id ? "0 4px 20px rgba(0,0,0,0.1)" : "0 1px 4px rgba(0,0,0,0.04)", transition: "all 0.2s", borderLeft: active === adr.id ? "4px solid #6366F1" : "4px solid transparent" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: "#6366F1" }}>{adr.id}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#22C55E", background: "#D1FAE5", padding: "2px 7px", borderRadius: 20 }}>{adr.status}</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#1E293B" }}>{adr.title}</div>
            {active === adr.id && (
              <div style={{ marginTop: 10, borderTop: "1px solid #F1F5F9", paddingTop: 10 }}>
                {[["Context", adr.context], ["Decision", adr.decision], ["Consequences", adr.consequences]].map(([label, val]) => (
                  <div key={label} style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>{val}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
