-- ============================================================
-- TRIGGER: Crear usuario en public.users cuando se registra en auth
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.users (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ============================================================
-- RLS POLICIES
-- Habilitar RLS en todas las tablas y agregar políticas
-- ============================================================

-- users
alter table public.users enable row level security;

create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id);


-- projects
alter table public.projects enable row level security;

create policy "Users can view their own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can create their own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "Users can delete their own projects"
  on public.projects for delete
  using (auth.uid() = user_id);


-- documents
alter table public.documents enable row level security;

create policy "Users can view their own documents"
  on public.documents for select
  using (auth.uid() = user_id);

create policy "Users can insert their own documents"
  on public.documents for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own documents"
  on public.documents for update
  using (auth.uid() = user_id);

create policy "Users can delete their own documents"
  on public.documents for delete
  using (auth.uid() = user_id);


-- resources
alter table public.resources enable row level security;

create policy "Users can view their own resources"
  on public.resources for select
  using (auth.uid() = user_id);

create policy "Users can create their own resources"
  on public.resources for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own resources"
  on public.resources for delete
  using (auth.uid() = user_id);


-- shared_exams
alter table public.shared_exams enable row level security;

create policy "Teachers can view their own shared exams"
  on public.shared_exams for select
  using (auth.uid() = teacher_id);

create policy "Teachers can create shared exams"
  on public.shared_exams for insert
  with check (auth.uid() = teacher_id);

create policy "Teachers can update their own shared exams"
  on public.shared_exams for update
  using (auth.uid() = teacher_id);

create policy "Teachers can delete their own shared exams"
  on public.shared_exams for delete
  using (auth.uid() = teacher_id);

-- Política adicional: acceso público al shared_exam por share_code (para la página del estudiante)
-- Esta policy se maneja desde el server con service role key, no con anon.


-- exam_attempts
alter table public.exam_attempts enable row level security;

-- El maestro puede ver los intentos de sus exámenes
create policy "Teachers can view attempts for their exams"
  on public.exam_attempts for select
  using (
    exists (
      select 1 from public.shared_exams se
      where se.id = shared_exam_id
        and se.teacher_id = auth.uid()
    )
  );

-- El estudiante puede ver sus propios intentos
create policy "Students can view their own attempts"
  on public.exam_attempts for select
  using (auth.uid() = student_id);

-- Insertar intentos (también anónimos — se maneja con service role desde la API)
create policy "Anyone can insert exam attempts"
  on public.exam_attempts for insert
  with check (true);


-- ============================================================
-- STORAGE BUCKET
-- Ejecutar también en SQL Editor O hacerlo desde el Dashboard:
-- Storage → New bucket → "documents" → private
-- ============================================================

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Policy de storage: el usuario solo puede acceder a su carpeta
create policy "Users can upload their own documents"
  on storage.objects for insert
  with check (
    bucket_id = 'documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can read their own documents"
  on storage.objects for select
  using (
    bucket_id = 'documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own documents"
  on storage.objects for delete
  using (
    bucket_id = 'documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
