import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useTickets(sprintId) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTickets = useCallback(async () => {
    if (!sprintId) { setTickets([]); setLoading(false); return; }
    setLoading(true);

    // Fetch tickets
    const { data: ticketData, error: ticketErr } = await supabase
      .from("tickets")
      .select("*")
      .eq("sprint_id", sprintId)
      .order("sort_order");

    if (ticketErr) {
      console.error("Tickets fetch error:", JSON.stringify(ticketErr));
      setError(ticketErr.message);
      setLoading(false);
      return;
    }

    if (!ticketData || ticketData.length === 0) {
      setTickets([]);
      setLoading(false);
      return;
    }

    const ticketIds = ticketData.map(t => t.id);

    // Fetch subtasks for these tickets
    const { data: subtaskData } = await supabase
      .from("subtasks")
      .select("*")
      .in("ticket_id", ticketIds)
      .order("sort_order");

    // Fetch deps for these tickets
    const { data: depsData } = await supabase
      .from("ticket_deps")
      .select("ticket_id, depends_on_legacy")
      .in("ticket_id", ticketIds);

    // Group subtasks and deps by ticket
    const subtasksByTicket = {};
    (subtaskData || []).forEach(s => {
      if (!subtasksByTicket[s.ticket_id]) subtasksByTicket[s.ticket_id] = [];
      subtasksByTicket[s.ticket_id].push(s);
    });

    const depsByTicket = {};
    (depsData || []).forEach(d => {
      if (!depsByTicket[d.ticket_id]) depsByTicket[d.ticket_id] = [];
      depsByTicket[d.ticket_id].push(d.depends_on_legacy);
    });

    // Transform
    const transformed = ticketData.map(t => {
      const subs = (subtasksByTicket[t.id] || []).sort((a, b) => a.sort_order - b.sort_order);
      return {
        ...t,
        id: t.legacy_id || t.id,
        _uuid: t.id,
        ticketNo: t.ticket_no,
        deps: depsByTicket[t.id] || [],
        subtasks: subs.map(s => s.title),
        _subtasks: subs,
      };
    });

    setTickets(transformed);
    setLoading(false);
  }, [sprintId]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const updateStatus = async (ticketUuid, newStatus) => {
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
