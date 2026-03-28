import Badge from "../ui/Badge";

export default function TicketCard({ task, isDone, onOpen, onClose, onDragStart, onDragEnd, isDragging, checkedSubtasks }) {
  const checked = task.subtasks.filter((_, i) => checkedSubtasks[`${task.id}:${i}`]).length;
  const total = task.subtasks.length;
  return (
    <div
      draggable
      onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", task.id); onDragStart(task.id); }}
      onDragEnd={onDragEnd}
      onClick={() => onOpen(task)}
      style={{
        background: isDone ? "var(--card-bg-done)" : "var(--card-bg)",
        border: task.resolved ? "1.5px solid #86EFAC" : "1px solid var(--card-border)",
        borderRadius: 8, padding: "10px 12px", marginBottom: 6,
        cursor: "grab", opacity: isDragging ? 0.35 : 1,
        boxShadow: isDragging ? "0 8px 24px rgba(0,0,0,0.15)" : "0 1px 3px rgba(0,0,0,0.06)",
        transition: "box-shadow 0.15s, opacity 0.15s, transform 0.15s",
        transform: isDragging ? "rotate(2deg) scale(1.02)" : "none",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "monospace", fontSize: 10, color: isDone ? "var(--text-muted)" : "#6366F1", fontWeight: 800 }}>#{task.ticketNo}</span>
            <Badge tag={task.tag} />
            {task.resolved && <span style={{ background: "#DCFCE7", color: "#15803D", fontSize: 8, fontWeight: 800, padding: "1px 5px", borderRadius: 20, textTransform: "uppercase", border: "1px solid #86EFAC" }}>RISK</span>}
          </div>
          <div style={{ fontWeight: 600, fontSize: 12.5, color: isDone ? "var(--text-muted)" : "var(--card-text)", textDecoration: isDone ? "line-through" : "none", lineHeight: 1.35 }}>
            {task.title}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {task.artifact}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
          <span style={{ background: "#F1F5F9", borderRadius: 4, padding: "1px 5px", fontSize: 10, fontWeight: 700, color: "#64748B" }}>{task.hours}h</span>
          {!isDone && (
            <button
              onClick={(e) => { e.stopPropagation(); onClose(task.id); }}
              title="Mark as done"
              style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 4, cursor: "pointer", padding: "2px 5px", fontSize: 11, color: "#16A34A", fontWeight: 700, lineHeight: 1, transition: "all 0.15s" }}
              onMouseOver={e => { e.currentTarget.style.background = "#DCFCE7"; }}
              onMouseOut={e => { e.currentTarget.style.background = "#F0FDF4"; }}
            >&#10003;</button>
          )}
          {isDone && (
            <span style={{ fontSize: 14, color: "#16A34A" }}>&#10003;</span>
          )}
        </div>
      </div>
      {/* Subtask progress bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
        <div style={{ flex: 1, height: 3, background: "#F1F5F9", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ width: total > 0 ? `${(checked / total) * 100}%` : "0%", height: "100%", background: checked === total && total > 0 ? "#16A34A" : "#6366F1", borderRadius: 2, transition: "width 0.3s" }} />
        </div>
        <span style={{ fontSize: 9, fontWeight: 700, color: checked === total && total > 0 ? "#16A34A" : "var(--text-muted)" }}>{checked}/{total}</span>
      </div>
      {task.deps.length > 0 && (
        <div style={{ display: "flex", gap: 3, marginTop: 4, flexWrap: "wrap" }}>
          {task.deps.map(d => (
            <span key={d} style={{ background: "#F1F5F9", borderRadius: 3, padding: "0 4px", fontSize: 9, color: "var(--text-muted)", fontFamily: "monospace" }}>{d}</span>
          ))}
        </div>
      )}
    </div>
  );
}
