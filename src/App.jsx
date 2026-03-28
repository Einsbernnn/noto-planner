import { useState, useEffect } from "react";
import { STATUSES } from "./data/constants";
import { useBoards } from "./hooks/useBoards";
import { useSprints } from "./hooks/useSprints";
import { useTickets } from "./hooks/useTickets";
import { useSubtasks } from "./hooks/useSubtasks";
import Header from "./components/layout/Header";
import SprintSelector from "./components/layout/SprintSelector";
import KanbanColumn from "./components/board/KanbanColumn";
import DetailModal from "./components/detail/DetailModal";
import LoadingSpinner from "./components/ui/LoadingSpinner";
import ResolvedRisksSection from "./components/reference/ResolvedRisksSection";
import HostingSection from "./components/reference/HostingSection";
import ADRSection from "./components/reference/ADRSection";

export default function App() {
  const [tab, setTab] = useState("board");
  const [activeBoardId, setActiveBoardId] = useState(null);
  const [activeSprintId, setActiveSprintId] = useState(null);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [detailTask, setDetailTask] = useState(null);

  const { boards, loading: boardsLoading, createBoard } = useBoards();
  const { sprints, loading: sprintsLoading } = useSprints(activeBoardId);
  const { tickets, loading: ticketsLoading, updateStatus, resetAll, refetch: refetchTickets } = useTickets(activeSprintId);
  const { toggleSubtask, updateTitle, resetChecks } = useSubtasks();

  // Auto-select first board
  useEffect(() => {
    if (boards.length > 0 && !activeBoardId) setActiveBoardId(boards[0].id);
  }, [boards, activeBoardId]);

  // Auto-select first sprint when sprints load or change
  useEffect(() => {
    if (sprints.length > 0) {
      // If current selection is not in the list, select first
      const valid = sprints.some(s => s.id === activeSprintId);
      if (!valid) setActiveSprintId(sprints[0].id);
    }
  }, [sprints, activeSprintId]);

  // Escape closes modal
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setDetailTask(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const activeSprint = sprints.find(s => s.id === activeSprintId);
  const allTickets = tickets;
  const allDone = allTickets.filter(t => t.status === "done").length;
  const sprintDone = allTickets.filter(t => t.status === "done").length;
  const sprintHours = allTickets.reduce((a, t) => a + t.hours, 0);

  // Build checked subtasks map from Supabase data for components
  const checkedSubtasks = {};
  allTickets.forEach(t => {
    (t._subtasks || []).forEach((s, i) => {
      if (s.is_checked) checkedSubtasks[`${t.id}:${i}`] = true;
    });
  });

  // Build taskStatuses map from tickets for KanbanColumn
  const taskStatuses = {};
  allTickets.forEach(t => { taskStatuses[t.id] = t.status; });

  const handleDragStart = (taskId) => setDraggedTaskId(taskId);
  const handleDragEnd = () => { setDraggedTaskId(null); setDragOverCol(null); };
  const handleDragOver = (colId) => setDragOverCol(colId);
  const handleDragLeave = () => setDragOverCol(null);
  const handleDrop = (e, colId) => {
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      const ticket = allTickets.find(t => t.id === taskId);
      if (ticket) updateStatus(ticket._uuid, colId);
    }
    setDraggedTaskId(null);
    setDragOverCol(null);
  };
  const handleCloseTask = (taskId) => {
    const ticket = allTickets.find(t => t.id === taskId);
    if (ticket) updateStatus(ticket._uuid, "done");
  };
  const handleStatusChange = (taskId, newStatus) => {
    const ticket = allTickets.find(t => t.id === taskId);
    if (ticket) updateStatus(ticket._uuid, newStatus);
  };
  const handleResetBoard = async () => {
    await resetAll(allTickets);
    const uuids = allTickets.map(t => t._uuid);
    await resetChecks(uuids);
    refetchTickets();
  };
  const handleToggleSubtask = async (key) => {
    const [taskId, idxStr] = key.split(":");
    const ticket = allTickets.find(t => t.id === taskId);
    if (!ticket) return;
    const subtask = ticket._subtasks[parseInt(idxStr)];
    if (!subtask) return;
    const ok = await toggleSubtask(subtask.id, subtask.is_checked);
    if (ok) refetchTickets();
  };
  const handleUpdateSubtaskTitle = async (subtaskId, newTitle) => {
    const ok = await updateTitle(subtaskId, newTitle);
    if (ok) refetchTickets();
  };

  const activeBoard = boards.find(b => b.id === activeBoardId);
  const isLoading = boardsLoading || sprintsLoading || ticketsLoading;

  const TABS = [
    { id: "board", label: "Board" },
    { id: "resolved", label: "Risks" },
    { id: "hosting", label: "Hosting" },
    { id: "adrs", label: "ADRs" },
  ];

  return (
    <div style={{ fontFamily: "var(--sans)", background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ background: "var(--header-bg)", padding: "12px 20px 0", boxShadow: "0 4px 24px rgba(0,0,0,0.15)", flexShrink: 0 }}>
        <Header
          allDone={allDone}
          totalTasks={allTickets.length}
          totalHours={sprintHours}
          onReset={handleResetBoard}
          boards={boards}
          activeBoard={activeBoard}
          onBoardChange={setActiveBoardId}
          onCreateBoard={createBoard}
        />
        <div style={{ display: "flex", gap: 2, marginTop: 10 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: tab === t.id ? "var(--tab-active)" : "transparent",
              color: tab === t.id ? "#fff" : "var(--header-muted)",
              border: "none", cursor: "pointer", padding: "7px 16px",
              borderRadius: "6px 6px 0 0", fontWeight: 700, fontSize: 12,
              transition: "all 0.15s",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Board Tab */}
      {tab === "board" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {sprints.length > 0 && (
            <SprintSelector
              sprints={sprints}
              activeSprint={activeSprintId}
              setActiveSprint={setActiveSprintId}
              activeSprintTickets={allTickets}
            />
          )}

          {activeSprint && !ticketsLoading && (
            <div style={{ padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontWeight: 800, fontSize: 16, color: activeSprint.accent }}>{activeSprint.label}</span>
                <span style={{ color: "var(--card-border)" }}>|</span>
                <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>{activeSprint.theme}</span>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: sprintDone === allTickets.length && allTickets.length > 0 ? "#16A34A" : "var(--text-muted)" }}>
                  {sprintDone}/{allTickets.length} tickets
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>{sprintHours}h estimated</span>
                <div style={{ width: 100, height: 6, background: "var(--card-border)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: allTickets.length > 0 ? `${(sprintDone / allTickets.length) * 100}%` : "0%", height: "100%", background: sprintDone === allTickets.length && allTickets.length > 0 ? "#16A34A" : activeSprint.accent, borderRadius: 3, transition: "width 0.4s" }} />
                </div>
              </div>
            </div>
          )}

          {isLoading && <LoadingSpinner message="Loading board..." />}

          {!ticketsLoading && activeSprint && (
            <div style={{ flex: 1, padding: "0 12px 16px", display: "flex", gap: 10, overflowX: "auto", overflowY: "hidden" }}>
              {STATUSES.map(status => (
                <KanbanColumn
                  key={status.id}
                  status={status}
                  tasks={allTickets}
                  taskStatuses={taskStatuses}
                  dragOverCol={dragOverCol}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onOpenTask={(task) => setDetailTask(task)}
                  onCloseTask={handleCloseTask}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  draggedTaskId={draggedTaskId}
                  checkedSubtasks={checkedSubtasks}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "resolved" && <div style={{ flex: 1, overflowY: "auto" }}><ResolvedRisksSection /></div>}
      {tab === "hosting" && <div style={{ flex: 1, overflowY: "auto" }}><HostingSection /></div>}
      {tab === "adrs" && <div style={{ flex: 1, overflowY: "auto" }}><ADRSection /></div>}

      {detailTask && (
        <DetailModal
          task={detailTask}
          status={taskStatuses[detailTask.id]}
          onDismiss={() => setDetailTask(null)}
          onStatusChange={handleStatusChange}
          checkedSubtasks={checkedSubtasks}
          onToggleSubtask={handleToggleSubtask}
          onUpdateSubtaskTitle={handleUpdateSubtaskTitle}
        />
      )}
    </div>
  );
}
