import { TAG_COLORS } from "../../data/constants";

export default function Badge({ tag }) {
  const c = TAG_COLORS[tag] || { bg: "#F1F5F9", text: "#334155" };
  return (
    <span style={{
      background: c.bg, color: c.text, fontSize: 9, fontWeight: 700,
      letterSpacing: "0.05em", padding: "2px 6px", borderRadius: 20,
      textTransform: "uppercase", whiteSpace: "nowrap",
    }}>
      {tag}
    </span>
  );
}
