-- New index on historyentries
-- Useful for queries on user_id + type + created_at
-- Created for the "message reply rate" chart purpose
CREATE INDEX IF NOT EXISTS historyentries_user_type_created_idx
  ON public.historyentries (user_id, type, created_at);
