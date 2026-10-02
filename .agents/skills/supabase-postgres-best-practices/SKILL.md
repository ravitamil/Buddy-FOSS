---
name: supabase-postgres-best-practices
description: Best practices for database schema, migrations, RLS policies, and query operations with Supabase and PostgreSQL in Buddy. Use when creating/modifying migrations, schema tables, RLS policies, or Supabase queries.
---

# Supabase & PostgreSQL Best Practices for Buddy

## 1. Database Architecture & Schema

- **Location**: Database schema is in `supabase/schema.sql`, and migrations are in `supabase/migrations/<timestamp>_<description>.sql`.
- **Primary Keys**: Use `UUID PRIMARY KEY DEFAULT gen_random_uuid()` or `uuid_generate_v4()`.
- **Timestamps**: All tables must have `created_at TIMESTAMPTZ DEFAULT now() NOT NULL` and `updated_at TIMESTAMPTZ DEFAULT now() NOT NULL`.
- **Foreign Keys**: Always specify `ON DELETE CASCADE` or `ON DELETE SET NULL` appropriately to avoid orphaned records. Always add indexes on foreign key columns used in joins or filter predicates.

## 2. Row Level Security (RLS)

- Every table must have RLS enabled: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`.
- Use specific policies for `SELECT`, `INSERT`, `UPDATE`, and `DELETE`.
- Always verify `auth.uid()` conditions:
  ```sql
  CREATE POLICY "Users can manage their own records"
  ON table_name
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
  ```
- For group expenses and shared entities, check membership via subqueries or helper security definer functions.

## 3. Data Layer in App

- **Service Layer**: All Supabase database interactions go through `src/services/SupabaseDatabaseService.ts` or domain service classes in `src/services/`.
- **Supabase Client**: Single instance configured in `src/lib/supabase.ts`.
- **React Query + MMKV**: Use TanStack React Query for caching server state with MMKV encrypted persistence for offline support. Invalidate query keys when mutations complete.
