-- Choco Planner: liste securisee des utilisateurs pour l'ecran d'administration.
-- Executer une seule fois dans Supabase > SQL Editor.

create or replace function public.admin_list_users()
returns table (
  id uuid,
  email text,
  full_name text,
  role text,
  active boolean,
  created_at timestamptz,
  last_sign_in_at timestamptz
)
language sql
stable
security definer
set search_path = public, auth
as $$
  select
    u.id,
    u.email::text,
    p.full_name,
    p.role,
    p.active,
    u.created_at,
    u.last_sign_in_at
  from auth.users u
  join public.profiles p on p.id = u.id
  where public.current_app_role() = 'admin'
  order by lower(u.email);
$$;

revoke all on function public.admin_list_users() from public;
grant execute on function public.admin_list_users() to authenticated;
