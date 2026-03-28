import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useBoards() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBoards = async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from("boards")
      .select("*")
      .order("created_at");
    if (err) setError(err.message);
    else setBoards(data);
    setLoading(false);
  };

  useEffect(() => { fetchBoards(); }, []);

  const createBoard = async (name, description = "") => {
    const { data, error: err } = await supabase
      .from("boards")
      .insert({ name, description })
      .select()
      .single();
    if (err) { setError(err.message); return null; }
    setBoards(prev => [...prev, data]);
    return data;
  };

  return { boards, loading, error, createBoard, refetch: fetchBoards };
}
