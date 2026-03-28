import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useTickets(sprintId) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTickets = useCallback(async () => {
    if (!sprintId) { setTickets([]); setLoading(false); return; }
    setLoading(true);
    const { data, error: err } = await supabase
      .from("tickets")
      .select("*, subtasks(*, id, sort_order, title, detail, is_checked), ticket_deps(depends_on_legacy)")
      .eq("sprint_id", sprintId)
      .order("sort_order")
      .order("sort_order", { referencedTable: "subtasks" });
    if (err) setError(err.message);
    else {
      // Transform to match the component interface
      const transformed = data.map(t => ({
        ...t,
        id: t.legacy_id || t.id,
        _uuid: t.id,
        ticketNo: t.ticket_no,
        deps: (t.ticket_deps || []).map(d => d.depends_on_legacy),
        subtasks: (t.subtasks || []).map(s => s.title),
        _subtasks: t.subtasks || [],
      }));
      setTickets(transformed);
    }
    setLoading(false);
  }, [sprintId]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const updateStatus = async (ticketUuid, newStatus) => {
    // Optimistic update
    setTickets(prev => prev.map(t => t._uuid === ticketUuid ? { ...t, status: newStatus } : t));
    const { error: err } = await supabase.from("tickets").update({ status: newStatus }).eq("id", ticketUuid);
    if (err) { setError(err.message); fetchTickets(); }
  };

  const resetAll = async (sprintTickets) => {
    const ids = sprintTickets.map(t => t._uuid);
    setTickets(prev => prev.map(t => ({ ...t, status: "backlog" })));
    const { error: err } = await supabase.from("tickets").update({ status: "backlog" }).in("id", ids);
    if (err) { setError(err.message); fetchTickets(); }
  };

  return { tickets, loading, error, updateStatus, resetAll, refetch: fetchTickets };
}
