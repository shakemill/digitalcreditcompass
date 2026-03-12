-- Grant the app user (shakemill) access to dcc_mvp and public schema.
-- Run as superuser (e.g. postgres). From project root:
--
--   psql -U postgres -d postgres -f scripts/grant-db-access.sql
--

GRANT ALL PRIVILEGES ON DATABASE dcc_mvp TO shakemill;

\connect dcc_mvp;

GRANT ALL ON SCHEMA public TO shakemill;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO shakemill;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO shakemill;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO shakemill;
