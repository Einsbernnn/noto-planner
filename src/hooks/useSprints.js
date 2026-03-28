import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useSprints(boardId) {
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!boardId) { setSprints([]); setLoading(false); return; }
    setLoading(true);
    supabase
      .from("sprints")
      .select("*")
      .eq("board_id", boardId)
      .order("sort_order")
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        else setSprints(data);
        setLoading(false);
      });
  }, [boardId]);

  return { sprints, loading, error };
}
