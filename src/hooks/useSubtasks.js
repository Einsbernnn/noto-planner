import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useSubtasks() {
  const [error, setError] = useState(null);

  const toggleSubtask = useCallback(async (subtaskId, currentValue) => {
    const { error: err } = await supabase
      .from("subtasks")
      .update({ is_checked: !currentValue })
      .eq("id", subtaskId);
    if (err) setError(err.message);
    return !err;
  }, []);

  const updateTitle = useCallback(async (subtaskId, newTitle) => {
    const { error: err } = await supabase
      .from("subtasks")
      .update({ title: newTitle })
      .eq("id", subtaskId);
    if (err) setError(err.message);
    return !err;
  }, []);

  const resetChecks = useCallback(async (ticketUuids) => {
    const { error: err } = await supabase
      .from("subtasks")
      .update({ is_checked: false })
      .in("ticket_id", ticketUuids);
    if (err) setError(err.message);
    return !err;
  }, []);

  return { toggleSubtask, updateTitle, resetChecks, error };
}
