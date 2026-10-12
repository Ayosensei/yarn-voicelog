# YARN Database (Supabase)

This folder contains the database schemas and migration tools for the YARN Supabase integration.

## Files
- `01_schema.sql`: The main PostgreSQL schema for `users`, `logs`, and `vocabulary`.
- `migrate.py`: A Python script to run the schema against the live Supabase database.

## Notes on Architecture
- **Row Level Security (RLS)**: RLS is enabled on all tables, but no policies are defined. This is intentional. The frontend does not connect to Supabase directly. All database access goes through the Python FastAPI backend, which uses the `service_role` key to bypass RLS. This makes the database extremely secure.
- **Connection Pooler**: The live database is hosted in London (`eu-west-2`). `migrate.py` connects via the Supabase connection pooler on port `6543`.
