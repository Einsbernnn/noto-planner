-- NOTO Planner: Database Schema
-- Run this in Supabase SQL Editor

-- ── BOARDS ──────────────────────────────────────────────
CREATE TABLE boards (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── SPRINTS ─────────────────────────────────────────────
CREATE TABLE sprints (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id    UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  sort_order  INT NOT NULL,
  label       TEXT NOT NULL,
  theme       TEXT,
  color       TEXT,
  accent      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sprints_board ON sprints(board_id, sort_order);

-- ── TICKETS ─────────────────────────────────────────────
CREATE TABLE tickets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id   UUID NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
  board_id    UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  legacy_id   TEXT,
  ticket_no   TEXT NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  artifact    TEXT,
  hours       INT NOT NULL DEFAULT 0,
  tag         TEXT,
  status      TEXT NOT NULL DEFAULT 'backlog',
  resolved    TEXT,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_tickets_sprint ON tickets(sprint_id);
CREATE INDEX idx_tickets_board_status ON tickets(board_id, status);

-- ── SUBTASKS ────────────────────────────────────────────
CREATE TABLE subtasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id   UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  sort_order  INT NOT NULL,
  title       TEXT NOT NULL,
  detail      TEXT,
  is_checked  BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_subtasks_ticket ON subtasks(ticket_id, sort_order);

-- ── TICKET DEPENDENCIES ─────────────────────────────────
CREATE TABLE ticket_deps (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id       UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  depends_on_id   UUID REFERENCES tickets(id) ON DELETE CASCADE,
  depends_on_legacy TEXT,
  UNIQUE(ticket_id, depends_on_legacy)
);
CREATE INDEX idx_ticket_deps_ticket ON ticket_deps(ticket_id);

-- ── ROW LEVEL SECURITY (permissive, no auth) ────────────
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_deps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_all" ON boards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON sprints FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON tickets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON subtasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON ticket_deps FOR ALL USING (true) WITH CHECK (true);

-- ── AUTO UPDATED_AT TRIGGER ─────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_boards_updated   BEFORE UPDATE ON boards   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_sprints_updated  BEFORE UPDATE ON sprints  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_tickets_updated  BEFORE UPDATE ON tickets  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_subtasks_updated BEFORE UPDATE ON subtasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
