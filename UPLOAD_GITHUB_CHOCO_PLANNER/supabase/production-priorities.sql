-- Choco Planner: priorites administratives de production.
-- Executer une seule fois dans Supabase > SQL Editor.

create table if not exists public.production_priorities (
  id uuid primary key default gen_random_uuid(),
  factory_id text not null,
  rule_type text not null
    check (rule_type in ('never_stockout', 'sequence', 'due_date', 'boosted_target')),
  product_id text not null,
  after_product_id text,
  priority integer not null default 50 check (priority between 1 and 100),
  target_multiplier numeric not null default 1.5 check (target_multiplier between 1 and 4),
  due_date date,
  note text not null default '',
  active boolean not null default true,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.production_priorities enable row level security;

drop policy if exists "Authenticated users read production priorities" on public.production_priorities;
create policy "Authenticated users read production priorities"
  on public.production_priorities for select to authenticated using (true);

drop policy if exists "Admins create production priorities" on public.production_priorities;
drop policy if exists "Editors create production priorities" on public.production_priorities;
create policy "Editors create production priorities"
  on public.production_priorities for insert to authenticated
  with check (public.current_app_role() in ('admin', 'planner', 'production') and created_by = auth.uid());

drop policy if exists "Admins update production priorities" on public.production_priorities;
drop policy if exists "Editors update production priorities" on public.production_priorities;
create policy "Editors update production priorities"
  on public.production_priorities for update to authenticated
  using (public.current_app_role() in ('admin', 'planner', 'production'))
  with check (public.current_app_role() in ('admin', 'planner', 'production'));

drop policy if exists "Admins delete production priorities" on public.production_priorities;
drop policy if exists "Editors delete production priorities" on public.production_priorities;
create policy "Editors delete production priorities"
  on public.production_priorities for delete to authenticated
  using (public.current_app_role() in ('admin', 'planner', 'production'));

create index if not exists production_priorities_factory_idx
  on public.production_priorities(factory_id, active, priority desc);
