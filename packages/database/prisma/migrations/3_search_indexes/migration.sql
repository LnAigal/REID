-- Enable pg_trgm for trigram-based ILIKE search on text columns
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add a denormalized search column that concatenates subject, from, and all
-- recipients (to/cc/bcc) into a single text column we can index with a GIN
-- trigram index. This lets ILIKE '%term%' search use an index instead of
-- performing an unindexed full table scan on the text[] columns.
ALTER TABLE "emails" ADD COLUMN IF NOT EXISTS "search_text" TEXT;

-- Backfill existing rows.
UPDATE "emails"
SET "search_text" = concat_ws(' ',
    subject,
    "from",
    array_to_string("to", ' '),
    array_to_string(cc, ' '),
    array_to_string(bcc, ' ')
);

-- Trigger function to keep search_text in sync on insert/update.
CREATE OR REPLACE FUNCTION fn_emails_search_text() RETURNS trigger AS $$
BEGIN
    NEW.search_text := concat_ws(' ',
        NEW.subject,
        NEW."from",
        array_to_string(NEW."to", ' '),
        array_to_string(NEW.cc, ' '),
        array_to_string(NEW.bcc, ' ')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_emails_search_text ON "emails";
CREATE TRIGGER trg_emails_search_text
    BEFORE INSERT OR UPDATE OF subject, "from", "to", cc, bcc ON "emails"
    FOR EACH ROW EXECUTE FUNCTION fn_emails_search_text();

-- GIN trigram index for ILIKE '%term%' search on the search column and subject.
CREATE INDEX IF NOT EXISTS "emails_search_text_trgm_idx" ON "emails" USING gin (search_text gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "emails_subject_trgm_idx" ON "emails" USING gin (subject gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "emails_from_trgm_idx" ON "emails" USING gin ("from" gin_trgm_ops);
