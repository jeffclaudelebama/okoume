-- Audit records can be created by both staff profiles and customer accounts.
-- Both identities originate from auth.users, so this preserves referential integrity.
alter table public.audit_log
  drop constraint if exists audit_log_actor_id_fkey;

alter table public.audit_log
  add constraint audit_log_actor_id_fkey
  foreign key (actor_id) references auth.users(id) on delete set null;
