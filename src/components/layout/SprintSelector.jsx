export default function SprintSelector({ sprints, activeSprint, setActiveSprint, activeSprintTickets }) {
  return (
    <div style={{ background: "var(--card-bg)", borderBottom: "1px solid var(--card-border)", padding: "6px 16px", display: "flex", gap: 4, overflowX: "auto", flexShrink: 0 }}>
      {sprints.map(s => {
        const isActive = activeSprint === s.id;
        // Only show ticket counts for the active sprint (we only have those loaded)
        const done = isActive ? activeSprintTickets.filter(t => t.status === "done").length : 0;
        const total = isActive ? activeSprintTickets.length : 0;
        return (
          <button key={s.id} onClick={() => setActiveSprint(s.id)} style={{
            background: isActive ? (s.accent || "var(--tab-active)") + "12" : "transparent",
            border: isActive ? `2px solid ${s.accent || "var(--tab-active)"}` : "2px solid transparent",
            borderRadius: 8, padding: "8px 14px", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 3,
            minWidth: 140, transition: "all 0.15s", flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, width: "100%" }}>
              <span style={{ fontWeight: 800, fontSize: 12, color: isActive ? (s.accent || "var(--tab-active)") : "var(--text-muted)" }}>{s.label}</span>
              {isActive && total > 0 && (
                <span style={{ fontSize: 10, fontWeight: 700, color: done === total ? "#16A34A" : "var(--text-muted)", marginLeft: "auto" }}>
                  {done === total ? "\u2713" : `${done}/${total}`}
                </span>
              )}
            </div>
            <span style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "left" }}>{s.theme}</span>
            {isActive && total > 0 && (
              <div style={{ width: "100%", height: 3, background: "var(--surface-alt)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${(done / total) * 100}%`, height: "100%", background: done === total ? "#16A34A" : (s.accent || "var(--tab-active)"), borderRadius: 2, transition: "width 0.3s" }} />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
