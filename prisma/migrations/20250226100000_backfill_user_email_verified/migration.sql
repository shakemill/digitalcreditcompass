-- Backfill: mark existing users (created before email verification flow) as verified
-- so they can sign in. New users will get the normal verification flow.
UPDATE "User"
SET "emailVerified" = true,
    "emailVerificationToken" = null,
    "emailVerificationExpiresAt" = null
WHERE "emailVerified" = false;
