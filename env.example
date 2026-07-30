-- Ejecutar una vez en Supabase > SQL Editor para compartir las líneas activas.

create table if not exists public.production_line_settings (
  factory_id text not null,
  line_id text not null,
  active boolean not null default true,
  updated_by uuid not null references auth.users(id),
  updated_at timestamptz not null default now(),
  primary key (factory_id, line_id)
);

alter table public.production_line_settings enable row level security;

drop policy if exists "Authenticated users read production line settings" on public.production_line_settings;
create policy "Authenticated users read production line settings"
  on public.production_line_settings for select to authenticated using (true);

drop policy if exists "Planners create production line settings" on public.production_line_settings;
create policy "Planners create production line settings"
  on public.production_line_settings for insert to authenticated
  with check (public.current_app_role() in ('admin', 'planner') and updated_by = auth.uid());

drop policy if exists "Planners update production line settings" on public.production_line_settings;
create policy "Planners update production line settings"
  on public.production_line_settings for update to authenticated
  using (public.current_app_role() in ('admin', 'planner'))
  with check (public.current_app_role() in ('admin', 'planner') and updated_by = auth.uid());

create index if not exists production_line_settings_factory_idx
  on public.production_line_settings(factory_id, active, line_id);
