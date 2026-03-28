import TicketCard from "./TicketCard";

export default function KanbanColumn({ status, tasks, taskStatuses, dragOverCol, onDragOver, onDragLeave, onDrop, onOpenTask, onCloseTask, onDragStart, onDragEnd, draggedTaskId, checkedSubtasks }) {
  const colTasks = tasks.filter(t => taskStatuses[t.id] === status.id);
  const isOver = dragOverCol === status.id;

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; onDragOver(status.id); }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) onDragLeave(); }}
      onDrop={(e) => { e.preventDefault(); onDrop(e, status.id); }}
      style={{
        flex: "1 1 0", minWidth: 230, maxWidth: 320,
        background: isOver ? status.accent + "60" : status.bg,
        borderRadius: 10,
        border: isOver ? `2px dashed ${status.color}` : "2px solid transparent",
        padding: 8, transition: "background 0.2s, border-color 0.2s",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* Column Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px 10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: status.color }} />
          <span style={{ fontWeight: 700, fontSize: 12, color: status.color, textTransform: "uppercase", letterSpacing: "0.04em" }}>{status.label}</span>
        </div>
        <span style={{ background: status.color + "20", color: status.color, fontWeight: 800, fontSize: 11, borderRadius: 10, padding: "1px 8px", minWidth: 18, textAlign: "center" }}>
          {colTasks.length}
        </span>
      </div>

      {/* Cards */}
      <div className="kanban-scroll" style={{ flex: 1, overflowY: "auto", minHeight: 60, paddingRight: 2 }}>
        {colTasks.map(task => (
          <TicketCard
            key={task.id}
            task={task}
            isDone={status.id === "done"}
            onOpen={onOpenTask}
            onClose={onCloseTask}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            isDragging={draggedTaskId === task.id}
            checkedSubtasks={checkedSubtasks}
          />
        ))}
        {colTasks.length === 0 && (
          <div style={{ textAlign: "center", padding: "20px 8px", color: "#CBD5E1", fontSize: 12, fontStyle: "italic", border: "1px dashed var(--card-border)", borderRadius: 8, margin: "4px 0" }}>
            {isOver ? "Drop here" : "No tickets"}
          </div>
        )}
      </div>
    </div>
  );
}
