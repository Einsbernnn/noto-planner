import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";

export default function Header({ allDone, totalTasks, totalHours, onReset, boards, activeBoard, onBoardChange, onCreateBoard }) {
  const { theme, toggleTheme } = useTheme();
  const [showBoards, setShowBoards] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");

  const themeIcon = theme === "dark" ? "\u2600\uFE0F" : "\uD83C\uDF19";
  const themeTitle = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) return;
    const board = await onCreateBoard(newBoardName.trim());
    if (board) { onBoardChange(board.id); setNewBoardName(""); setShowBoards(false); }
  };

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h1 style={{ fontWeight: 900, fontSize: 22, color: "var(--header-text)", margin: 0, letterSpacing: "-0.5px" }}>NOTO</h1>
        {/* Board selector */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowBoards(!showBoards)}
            style={{
              background: "var(--header-surface)", border: "1px solid var(--header-border)",
              borderRadius: 6, padding: "4px 10px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
              color: "var(--header-text)", fontSize: 12, fontWeight: 600,
            }}
          >
            {activeBoard?.name || "Select Board"}
            <span style={{ fontSize: 8, color: "var(--header-muted)" }}>{"\u25BC"}</span>
          </button>
          {showBoards && (
            <div style={{
              position: "absolute", top: "100%", left: 0, marginTop: 4, zIndex: 100,
              background: "var(--card-bg)", border: "1px solid var(--card-border)",
              borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              minWidth: 200, overflow: "hidden",
            }}>
              {boards.map(b => (
                <button key={b.id} onClick={() => { onBoardChange(b.id); setShowBoards(false); }}
                  style={{
                    display: "block", width: "100%", padding: "8px 12px", border: "none",
                    background: b.id === activeBoard?.id ? "var(--accent-bg)" : "transparent",
                    color: "var(--card-text)", fontSize: 12, fontWeight: 600,
                    cursor: "pointer", textAlign: "left",
                  }}
                >
                  {b.name}
                </button>
              ))}
              <div style={{ borderTop: "1px solid var(--card-border)", padding: "8px" }}>
                <div style={{ display: "flex", gap: 4 }}>
                  <input
                    value={newBoardName}
                    onChange={e => setNewBoardName(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleCreateBoard()}
                    placeholder="New board name..."
                    style={{
                      flex: 1, padding: "4px 8px", fontSize: 11, borderRadius: 4,
                      border: "1px solid var(--card-border)", background: "var(--surface)",
                      color: "var(--card-text)", outline: "none",
                    }}
                  />
                  <button onClick={handleCreateBoard} style={{
                    background: "var(--tab-active)", color: "#fff", border: "none",
                    borderRadius: 4, padding: "4px 8px", fontSize: 11, fontWeight: 700,
                    cursor: "pointer",
                  }}>+</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {totalTasks > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--header-surface)", borderRadius: 8, padding: "5px 12px" }}>
            <div style={{ width: 80, height: 5, background: "var(--header-border)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: totalTasks > 0 ? `${(allDone / totalTasks) * 100}%` : "0%", height: "100%", background: "#22C55E", borderRadius: 3, transition: "width 0.4s" }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--header-muted)" }}>{allDone}/{totalTasks}</span>
          </div>
        )}
        {totalHours > 0 && (
          <div style={{ background: "var(--header-border)", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 700, color: "var(--header-muted)" }}>{totalHours}h</div>
        )}
        <button onClick={toggleTheme} title={themeTitle} style={{
          background: "transparent", border: "1px solid var(--header-border)", borderRadius: 6,
          padding: "4px 10px", fontSize: 14, cursor: "pointer", transition: "all 0.15s",
          display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
        }}>{themeIcon}</button>
        <button onClick={onReset} title="Reset all tickets to Backlog" style={{
          background: "transparent", border: "1px solid var(--header-border)", borderRadius: 6,
          padding: "4px 10px", fontSize: 11, fontWeight: 600, color: "var(--header-muted)",
          cursor: "pointer", transition: "all 0.15s",
        }} onMouseOver={e => { e.currentTarget.style.borderColor = "#EF4444"; e.currentTarget.style.color = "#EF4444"; }}
           onMouseOut={e => { e.currentTarget.style.borderColor = "var(--header-border)"; e.currentTarget.style.color = "var(--header-muted)"; }}
        >Reset</button>
      </div>
    </div>
  );
}
