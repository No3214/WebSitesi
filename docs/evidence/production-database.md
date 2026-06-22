# Evidence: production database

status: pending
date: 2026-06-22
owner: platform / CMS operator
source_refs: pending

## Summary

Kozbeyli Konağı uses Payload CMS with `@payloadcms/db-postgres`; production
runtime therefore requires a managed Postgres database through `DATABASE_URI`
and a strong `PAYLOAD_SECRET`.

Supabase can be used for this gate when the project Postgres pooler connection
string is stored only in Vercel production environment variables. The Supabase
MCP server is optional developer tooling and is not a production dependency.

The Supabase chatbot reported that it created generic multi-tenant public
tables (`organizations`, `organization_members`, `hotels`, `restaurants`) and
RLS policies. Treat that as external database state only. This Next.js project
currently uses Payload CMS collections through `@payloadcms/db-postgres`; those
generic public tables must not be connected to production flows until their RLS
helpers, recursion behavior, grants, bootstrap path and Payload compatibility
are independently verified.

## Proof

Before marking this file `ready`, collect redacted source-system references for:

- Vercel production env names `DATABASE_URI` and `PAYLOAD_SECRET`.
- Supabase or managed-Postgres project reference, region and pooling mode.
- Backup/PITR or restore policy confirmation.
- Restricted dashboard access/MFA confirmation for the database operator.
- A Payload admin login or lead persistence UAT that stores no raw customer PII
  in this repository.
- If using the chatbot-created `organizations` / `organization_members` tables:
  a source-system SQL/RLS audit proving no self-referential RLS recursion, no
  cross-organization owner/admin escalation, correct anon/authenticated grants
  and an approved bootstrap flow for the first organization owner.

Do not paste database URLs, passwords, service-role keys, access tokens, raw SQL
dumps, guest data or screenshots containing secrets into this file.

## Residual Risk

This gate remains blocked until the production database provider, connection
pooling, backup/restore policy and Payload persistence UAT are confirmed from
the source systems.

Do not add `SUPABASE_SERVICE_ROLE_KEY` to any `NEXT_PUBLIC_*` variable or client
component. Service-role credentials, if ever needed, must stay in server-only
Vercel environment variables and be used only after request authentication or
webhook signature verification.
