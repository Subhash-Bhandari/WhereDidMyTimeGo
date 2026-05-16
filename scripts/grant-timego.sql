-- Run as PostgreSQL superuser after creating user/database:
--   sudo -u postgres psql -f scripts/grant-timego.sql
--
-- Fixes: permission denied for schema public (PostgreSQL 15+)

GRANT ALL PRIVILEGES ON DATABASE wheredidmytimego TO timego;

\c wheredidmytimego

GRANT ALL ON SCHEMA public TO timego;
GRANT CREATE ON SCHEMA public TO timego;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO timego;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO timego;
