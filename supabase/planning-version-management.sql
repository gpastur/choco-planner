-- Choco Planner: gestion securisee des versions de planification.
-- Executer une seule fois dans Supabase > SQL Editor.

create or replace function public.manage_planning_version(
  p_version_id uuid,
  p_action text,
  p_name text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_version public.planning_versions%rowtype;
  v_role text;
begin
  select * into v_version from public.planning_versions where id = p_version_id;
  if not found then
    raise exception 'Version no encontrada.';
  end if;

  v_role := public.current_app_role();
  if v_role <> 'admin'
     and not (v_role = 'planner' and v_version.status = 'draft' and v_version.created_by = auth.uid()) then
    raise exception 'No tienes permiso para gestionar esta version.';
  end if;

  if p_action = 'rename' then
    if nullif(trim(p_name), '') is null then
      raise exception 'El nombre no puede estar vacio.';
    end if;
    update public.planning_versions set name = trim(p_name) where id = p_version_id;
  elsif p_action = 'archive' then
    if v_role <> 'admin' then raise exception 'Solo un admin puede archivar.'; end if;
    update public.planning_versions set status = 'archived' where id = p_version_id;
  elsif p_action = 'restore' then
    if v_role <> 'admin' then raise exception 'Solo un admin puede restaurar.'; end if;
    update public.planning_versions set status = 'approved' where id = p_version_id;
  elsif p_action = 'delete' then
    if v_role <> 'admin' then raise exception 'Solo un admin puede eliminar una version.'; end if;
    delete from public.planning_versions where id = p_version_id;
  else
    raise exception 'Accion no valida.';
  end if;

  insert into public.audit_events (user_id, planning_version_id, action, details)
  values (
    auth.uid(),
    case when p_action = 'delete' then null else p_version_id end,
    'planning_version_' || p_action,
    jsonb_build_object('version_id', p_version_id, 'name', v_version.name, 'status', v_version.status)
  );
end;
$$;

revoke all on function public.manage_planning_version(uuid, text, text) from public;
grant execute on function public.manage_planning_version(uuid, text, text) to authenticated;
