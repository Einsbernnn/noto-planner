import { useState } from "react";
import { HOSTING_OPTIONS } from "../../data/referenceData";
import SectionHeader from "../ui/SectionHeader";

export default function HostingSection() {
  const [selected, setSelected] = useState(null);
  const verdictStyle = { best: { bg: "#DCFCE7", text: "#15803D", label: "Best Free Option" }, good: { bg: "#DBEAFE", text: "#1E40AF", label: "Good" }, caution: { bg: "#FEF3C7", text: "#92400E", label: "Use With Caution" } };
  const backends = HOSTING_OPTIONS.filter(h => h.type === "Backend");
  const databases = HOSTING_OPTIONS.filter(h => h.type === "Database");

  const HostingCard = ({ h }) => {
    const v = verdictStyle[h.verdict];
    const isSelected = selected === h.name;
    return (
      <div onClick={() => setSelected(isSelected ? null : h.name)} style={{ background: "var(--card-bg)", border: h.recommended ? "2px solid #22C55E" : "1px solid #E2E8F0", borderRadius: 12, padding: "14px 16px", cursor: "pointer", boxShadow: isSelected ? "0 4px 20px rgba(0,0,0,0.1)" : "0 1px 4px rgba(0,0,0,0.04)", transition: "all 0.2s", position: "relative" }}>
        {h.recommended && <div style={{ position: "absolute", top: -10, right: 12, background: "#22C55E", color: "#fff", fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 20, textTransform: "uppercase", letterSpacing: "0.05em" }}>My Pick</div>}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: "var(--card-text)" }}>{h.name}</div>
          <span style={{ fontSize: 10, fontWeight: 700, background: v.bg, color: v.text, padding: "2px 8px", borderRadius: 20 }}>{v.label}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }}>
          {[["Free Tier", h.freeTier], ["Cold Start", h.coldStart], ["Sleep Policy", h.sleepPolicy]].map(([k, val]) => (
            <div key={k} style={{ gridColumn: k === "Sleep Policy" ? "1 / -1" : "auto" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{k}</div>
              <div style={{ fontSize: 12, color: "#334155", fontWeight: 600 }}>{val}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: "#64748B", fontStyle: "italic", marginBottom: isSelected ? 10 : 0 }}>"{h.myTake}"</div>
        {isSelected && (
          <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#22C55E", textTransform: "uppercase", marginBottom: 3 }}>Pros</div>
                {h.pros.map((p, i) => <div key={i} style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>+ {p}</div>)}
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#EF4444", textTransform: "uppercase", marginBottom: 3 }}>Cons</div>
                {h.cons.map((c, i) => <div key={i} style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>{"\u2212"} {c}</div>)}
              </div>
            </div>
            <div style={{ background: "#F0FDF4", borderRadius: 8, padding: "8px 10px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#15803D", textTransform: "uppercase", marginBottom: 3 }}>Mitigation Strategy</div>
              <div style={{ fontSize: 12, color: "var(--card-text)", lineHeight: 1.5 }}>{h.mitigation}</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: "20px 24px 32px" }}>
      <SectionHeader title="Hosting Options (Free Tier Comparison)" subtitle="My picks are marked. Click any card to see full pros/cons and mitigation strategy." icon={"\u2601\uFE0F"} />
      <div style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
        <span style={{ fontWeight: 700, fontSize: 12, color: "#C2410C" }}>Recommendation: </span>
        <span style={{ fontSize: 12, color: "#78350F" }}>Fly.io (backend) + Neon.tech (database). Both stay alive on free tier, minimal cold starts, no expiry.</span>
      </div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 11, color: "var(--text-muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Backend Hosting</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {backends.map(h => <HostingCard key={h.name} h={h} />)}
        </div>
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 11, color: "var(--text-muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Database Hosting</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {databases.map(h => <HostingCard key={h.name} h={h} />)}
        </div>
      </div>
    </div>
  );
}
