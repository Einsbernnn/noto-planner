export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: 60, gap: 12,
    }}>
      <div style={{
        width: 28, height: 28, border: "3px solid var(--border)",
        borderTopColor: "#6366F1", borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }} />
      <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>{message}</span>
    </div>
  );
}
