-- ============================================================
-- ناقشنا — جدول الملفّات الشخصية (مزامنة اختيارية عبر الأجهزة)
-- مصدر الحقيقة للمخطط. مُطبَّق على مشروع: umxhuuqsoygzcmpnliqb
-- ------------------------------------------------------------
-- مبدأ الخصوصية: لا يُخزَّن إلا الملف غير الحسّاس (العميل يفلتر
-- السياسة/الدين/الصحّة قبل الإرسال). الوصول عبر مصادقة مجهولة
-- (anonymous auth) فيكون لكل جهاز auth.uid() خاص، وRLS يضمن أن
-- كل مستخدم يرى/يعدّل صفّه فقط.
-- ============================================================

create table if not exists public.profiles (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,   -- {answers(آمنة), traits, summary, tips, streak}
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'ملف المستخدم غير الحسّاس — مزامنة اختيارية. الحسّاس يبقى محلياً.';

-- تفعيل أمان مستوى الصفّ
alter table public.profiles enable row level security;

-- سياسات: كل مستخدم محصور بصفّه فقط (auth.uid() = user_id)
create policy "select own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "insert own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "update own profile"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "delete own profile"
  on public.profiles for delete
  using (auth.uid() = user_id);

-- تحديث updated_at تلقائياً
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
