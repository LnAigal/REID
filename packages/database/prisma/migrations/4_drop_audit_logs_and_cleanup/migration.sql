-- Drop audit_logs table (feature removed, no Prisma model)
ALTER TABLE "audit_logs" DROP CONSTRAINT IF EXISTS "audit_logs_userId_fkey";
DROP INDEX IF EXISTS "audit_logs_userId_idx";
DROP INDEX IF EXISTS "audit_logs_action_idx";
DROP INDEX IF EXISTS "audit_logs_createdAt_idx";
DROP TABLE IF EXISTS "audit_logs";

-- Remove dead scalar columns from domains (data stored in domain_records)
ALTER TABLE "domains" DROP COLUMN IF EXISTS "spfRecord";
ALTER TABLE "domains" DROP COLUMN IF EXISTS "dkimRecord";
ALTER TABLE "domains" DROP COLUMN IF EXISTS "dmarcRecord";

-- Recreate domain_records.status using the DomainRecordStatus enum
-- (lowercase varchar values were never stored; default becomes PENDING)
DROP TYPE IF EXISTS "DomainRecordStatus";
CREATE TYPE "DomainRecordStatus" AS ENUM ('PENDING', 'VERIFIED', 'FAILED');
ALTER TABLE "domain_records" DROP COLUMN IF EXISTS "status";
ALTER TABLE "domain_records" ADD COLUMN "status" "DomainRecordStatus" NOT NULL DEFAULT 'PENDING';
