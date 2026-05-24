-- ─────────────────────────────────────────────────────────────
-- CUBOSAPIENS Blog table: additive migration
-- Adds community blog columns to the existing Blog table.
-- Safe to run, only adds columns, never drops anything.
--
-- Run in: Supabase Dashboard → SQL Editor → New query → Run
-- ─────────────────────────────────────────────────────────────

ALTER TABLE "Blog"
  ADD COLUMN IF NOT EXISTS "authorName"     TEXT,
  ADD COLUMN IF NOT EXISTS "authorEmail"    TEXT,
  ADD COLUMN IF NOT EXISTS "tags"           TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS "readingTimeMin" INTEGER DEFAULT 1;

-- Index for tag filtering (used by ilike search in the API)
CREATE INDEX IF NOT EXISTS idx_blog_tags
  ON "Blog" ("tags");

-- Verify columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'Blog'
ORDER BY ordinal_position;