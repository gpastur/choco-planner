create table if not exists public.planning_adjustments (
  id uuid primary key default gen_random_uuid(),
  planning_version_id uuid not null references public.planning_versions(id) on delete cascade,
  slot_key text not null,
  original_product_id text,
  product_id text,
  planned_kg numeric not null default 0,
  reason text,
  updated_by uuid not null references auth.users(id),
  updated_at timestamptz not null default now(),
  unique (planning_version_id, slot_key)
);

alter table public.planning_adjustments enable row level security;

drop policy if exists "Authenticated users read planning adjustments" on public.planning_adjustments;
create policy "Authenticated users read planning adjustments"
  on public.planning_adjustments for select to authenticated using (true);

drop policy if exists "Planners create planning adjustments" on public.planning_adjustments;
create policy "Planners create planning adjustments"
  on public.planning_adjustments for insert to authenticated
  with check (
    public.current_app_role() in ('admin', 'planner')
    and updated_by = auth.uid()
  );

drop policy if exists "Planners update planning adjustments" on public.planning_adjustments;
create policy "Planners update planning adjustments"
  on public.planning_adjustments for update to authenticated
  using (public.current_app_role() in ('admin', 'planner'))
  with check (
    public.current_app_role() in ('admin', 'planner')
    and updated_by = auth.uid()
  );

drop policy if exists "Planners delete planning adjustments" on public.planning_adjustments;
create policy "Planners delete planning adjustments"
  on public.planning_adjustments for delete to authenticated
  using (public.current_app_role() in ('admin', 'planner'));

create index if not exists planning_adjustments_version_idx
  on public.planning_adjustments(planning_version_id, updated_at desc);
