export default function SectionHeader({ title, subtitle, icon }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <h2 style={{ fontWeight: 800, fontSize: 18, color: "var(--card-text)", margin: 0 }}>{title}</h2>
      </div>
      {subtitle && <p style={{ margin: "4px 0 0 28px", fontSize: 13, color: "var(--text-muted)" }}>{subtitle}</p>}
    </div>
  );
}
