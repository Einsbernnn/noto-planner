import { useState } from "react";
import Badge from "../ui/Badge";
import { STATUSES } from "../../data/constants";

export default function DetailModal({ task, status, onDismiss, onStatusChange, onToggleSubtask, onUpdateSubtaskTitle }) {
  const [expandedSub, setExpandedSub] = useState(null);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editValue, setEditValue] = useState("");
  if (!task) return null;
  const currentStatus = STATUSES.find(s => s.id === status) || STATUSES[0];
  const subtaskObjects = task._subtasks || [];
  const checkedCount = subtaskObjects.filter(s => s.is_checked).length;

  const startEdit = (i, title) => {
    setEditingIdx(i);
    setEditValue(title);
  };
  const saveEdit = (subtask) => {
    if (editValue.trim() && editValue.trim() !== subtask.title && onUpdateSubtaskTitle) {
      onUpdateSubtaskTitle(subtask.id, editValue.trim());
    }
    setEditingIdx(null);
  };
  const cancelEdit = () => setEditingIdx(null);

  return (
    <div onClick={onDismiss} style={{ position: "fixed", inset: 0, background: "var(--overlay-bg)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "flex-start", paddingTop: 50, overflowY: "auto" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "var(--card-bg)", borderRadius: 14, width: 580, maxWidth: "92vw", boxShadow: "0 25px 60px rgba(0,0,0,0.25)", marginBottom: 50, animation: "modalIn 0.2s ease-out" }}>
        {/* Header */}
        <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid var(--card-border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "monospace", fontSize: 14, color: "#6366F1", fontWeight: 800 }}>#{task.ticketNo || task.ticket_no}</span>
                <Badge tag={task.tag} />
                <span style={{ background: currentStatus.color + "18", color: currentStatus.color, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, textTransform: "uppercase", letterSpacing: "0.03em" }}>{currentStatus.label}</span>
                {task.resolved && <span style={{ background: "#DCFCE7", color: "#15803D", fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 20, border: "1px solid #86EFAC" }}>RISK RESOLVED</span>}
              </div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--card-text)", lineHeight: 1.3 }}>{task.title}</h3>
            </div>
            <button onClick={onDismiss} style={{ background: "var(--surface)", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 16, color: "var(--text-muted)", padding: "4px 8px", marginLeft: 12, flexShrink: 0 }}>&#10005;</button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "18px 22px 22px" }}>
          {/* Description */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>Description</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.65, background: "var(--surface)", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--card-border)" }}>{task.description}</div>
          </div>

          {/* Info Row */}
          <div style={{ display: "flex", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Estimate</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--card-text)" }}>{task.hours}h</div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Task ID</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-muted)", fontFamily: "monospace" }}>{task.legacy_id || task.id}</div>
            </div>
            {task.deps && task.deps.length > 0 && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Blocked By</div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {task.deps.map(d => <span key={d} style={{ background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 4, padding: "2px 7px", fontSize: 11, fontWeight: 600, color: "#92400E", fontFamily: "monospace" }}>{d}</span>)}
                </div>
              </div>
            )}
          </div>

          {/* Output Artifact */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>Output Artifact</div>
            <div style={{ fontSize: 13, color: "var(--card-text)", fontStyle: "italic", background: "#EFF6FF", padding: "8px 12px", borderRadius: 8, border: "1px solid #DBEAFE" }}>{task.artifact}</div>
          </div>

          {/* Subtasks */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Subtasks <span style={{ color: "#CBD5E1" }}>({subtaskObjects.length})</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 60, height: 4, background: "var(--surface-alt)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: subtaskObjects.length > 0 ? `${(checkedCount / subtaskObjects.length) * 100}%` : "0%", height: "100%", background: checkedCount === subtaskObjects.length ? "#16A34A" : "#6366F1", borderRadius: 2, transition: "width 0.3s" }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: checkedCount === subtaskObjects.length ? "#16A34A" : "var(--text-muted)" }}>{checkedCount}/{subtaskObjects.length}</span>
              </div>
            </div>
            <div style={{ background: "var(--surface)", borderRadius: 8, border: "1px solid var(--card-border)", overflow: "hidden" }}>
              {subtaskObjects.map((sub, i) => {
                const key = `${task.id}:${i}`;
                const isChecked = sub.is_checked;
                const isExpanded = expandedSub === i;
                const isEditing = editingIdx === i;
                return (
                  <div key={sub.id || i} style={{ borderBottom: i < subtaskObjects.length - 1 ? "1px solid var(--card-border)" : "none", background: i % 2 === 0 ? "var(--card-bg)" : "var(--surface)" }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "8px 12px", cursor: "pointer" }}
                      onClick={() => !isEditing && setExpandedSub(isExpanded ? null : i)}>
                      {/* Checkbox */}
                      <div
                        onClick={(e) => { e.stopPropagation(); onToggleSubtask(key); }}
                        style={{
                          width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1, cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          background: isChecked ? "#16A34A" : "var(--card-bg)",
                          border: isChecked ? "2px solid #16A34A" : "2px solid #CBD5E1",
                          transition: "all 0.15s",
                        }}
                      >
                        {isChecked && <span style={{ color: "#fff", fontSize: 11, fontWeight: 800, lineHeight: 1 }}>{"\u2713"}</span>}
                      </div>
                      {/* Title (editable on double-click) */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
                          {isEditing ? (
                            <input
                              autoFocus
                              value={editValue}
                              onChange={e => setEditValue(e.target.value)}
                              onBlur={() => saveEdit(sub)}
                              onKeyDown={e => { if (e.key === "Enter") saveEdit(sub); if (e.key === "Escape") cancelEdit(); }}
                              onClick={e => e.stopPropagation()}
                              style={{
                                flex: 1, fontSize: 12.5, padding: "2px 6px", borderRadius: 4,
                                border: "1.5px solid #6366F1", outline: "none",
                                background: "var(--card-bg)", color: "var(--card-text)",
                                fontFamily: "inherit",
                              }}
                            />
                          ) : (
                            <span
                              onDoubleClick={(e) => { e.stopPropagation(); startEdit(i, sub.title); }}
                              title="Double-click to edit"
                              style={{ fontSize: 12.5, color: isChecked ? "var(--text-muted)" : "var(--card-text)", lineHeight: 1.5, textDecoration: isChecked ? "line-through" : "none", cursor: "text" }}
                            >{sub.title}</span>
                          )}
                          <div style={{ display: "flex", gap: 4, alignItems: "center", flexShrink: 0 }}>
                            {!isEditing && (
                              <span
                                onClick={(e) => { e.stopPropagation(); startEdit(i, sub.title); }}
                                title="Edit subtask"
                                style={{ fontSize: 11, color: "#CBD5E1", cursor: "pointer", opacity: 0.5, transition: "opacity 0.15s" }}
                                onMouseOver={e => e.currentTarget.style.opacity = "1"}
                                onMouseOut={e => e.currentTarget.style.opacity = "0.5"}
                              >{"\u270E"}</span>
                            )}
                            {sub.detail && <span style={{ fontSize: 11, color: "#CBD5E1", transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>{"\u25BC"}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                    {isExpanded && sub.detail && (
                      <div style={{ padding: "0 12px 10px 38px" }}>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6, background: "var(--surface)", borderRadius: 6, padding: "8px 12px", borderLeft: "3px solid #6366F1" }}>
                          {sub.detail}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resolved Risk */}
          {task.resolved && (
            <div style={{ marginBottom: 18, background: "#F0FDF4", border: "1.5px solid #86EFAC", borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#15803D", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>Risk Resolution</div>
              <div style={{ fontSize: 12.5, color: "#166534", lineHeight: 1.6 }}>{task.resolved}</div>
            </div>
          )}

          {/* Status Change */}
          <div style={{ borderTop: "1px solid var(--card-border)", paddingTop: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Move to</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {STATUSES.map(s => (
                <button
                  key={s.id}
                  onClick={() => onStatusChange(task.id, s.id)}
                  disabled={s.id === status}
                  style={{
                    background: s.id === status ? s.color : "var(--card-bg)",
                    color: s.id === status ? "#fff" : s.color,
                    border: `1.5px solid ${s.color}`,
                    borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 700,
                    cursor: s.id === status ? "default" : "pointer",
                    opacity: s.id === status ? 0.7 : 1,
                    transition: "all 0.15s",
                  }}
                  onMouseOver={e => { if (s.id !== status) { e.currentTarget.style.background = s.color; e.currentTarget.style.color = "#fff"; } }}
                  onMouseOut={e => { if (s.id !== status) { e.currentTarget.style.background = "var(--card-bg)"; e.currentTarget.style.color = s.color; } }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
