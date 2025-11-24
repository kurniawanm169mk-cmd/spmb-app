-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles (Extends Supabase Auth)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  role text check (role in ('admin', 'student')) default 'student',
  full_name text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Ensure columns exist (Migration for existing tables)
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'phone') then
    alter table profiles add column phone text;
  end if;
end $$;

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role, phone)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'student', new.raw_user_meta_data->>'phone');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger to AUTO CONFIRM users (Bypass Email Verification)
create or replace function public.auto_confirm_user()
returns trigger as $$
begin
  new.email_confirmed_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created_confirm on auth.users;
create trigger on_auth_user_created_confirm
  before insert on auth.users
  for each row execute procedure public.auto_confirm_user();

-- 2. School Settings (Singleton)
create table if not exists school_settings (
  id uuid primary key default uuid_generate_v4(),
  school_name text default 'SMPIT Ibnu Sina',
  slogan text default 'Generasi Islami, Unggul, Cerdas dan Berakhlak Mulia',
  address text default 'Alamat Sekolah...',
  google_maps_url text,
  contact_phone text,
  primary_color text default '#10b981', -- Emerald 500
  secondary_color text default '#059669', -- Emerald 600
  logo_url text,
  registration_open boolean default true,
  registration_start_date timestamp with time zone,
  registration_end_date timestamp with time zone,
  announcement_date timestamp with time zone,
  bank_name text,
  bank_account_number text,
  bank_account_holder text,
  registration_fee numeric default 0,
  registration_fee numeric default 0,
  is_setup boolean default false, -- To track if initial setup is done
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Ensure columns exist for school_settings
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'school_settings' and column_name = 'bank_name') then
    alter table school_settings add column bank_name text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'school_settings' and column_name = 'bank_account_number') then
    alter table school_settings add column bank_account_number text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'school_settings' and column_name = 'bank_account_holder') then
    alter table school_settings add column bank_account_holder text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'school_settings' and column_name = 'registration_fee') then
    alter table school_settings add column registration_fee numeric default 0;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'school_settings' and column_name = 'created_at') then
    alter table school_settings add column created_at timestamp with time zone default timezone('utc'::text, now());
  end if;
end $$;

-- 3. Carousel Images
create table if not exists carousel_images (
  id uuid primary key default uuid_generate_v4(),
  image_url text not null,
  caption text,
  order_index integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Social Media
create table if not exists social_media (
  id uuid primary key default uuid_generate_v4(),
  platform_name text not null,
  platform_url text not null,
  icon_url text, -- Custom icon upload
  is_active boolean default true
);

-- 5. Form Configuration (Dynamic Fields)
create table if not exists form_config (
  id uuid primary key default uuid_generate_v4(),
  field_name text not null, -- e.g., "nisn", "asal_sekolah"
  field_label text not null,
  field_type text not null, -- "text", "number", "date", "select", "file"
  is_required boolean default true,
  options text[], -- For select inputs
  order_index integer default 0
);

-- 6. Registrations (Student Data)
create table if not exists registrations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  status text check (status in ('registered', 'payment_submitted', 'payment_verified', 'documents_submitted', 'verified', 'passed', 'failed')) default 'registered',
  payment_proof_url text,
  payment_submitted_at timestamp with time zone,
  payment_verified_at timestamp with time zone,
  form_data jsonb, -- Stores dynamic form responses
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 7. Documents (Uploaded Files)
create table if not exists documents (
  id uuid primary key default uuid_generate_v4(),
  registration_id uuid references registrations(id) on delete cascade,
  document_type text not null, -- e.g., "kk", "akta"
  file_url text not null,
  uploaded_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS Policies (Basic Setup - Refine as needed)
alter table profiles enable row level security;
alter table school_settings enable row level security;
alter table carousel_images enable row level security;
alter table social_media enable row level security;
alter table form_config enable row level security;
alter table registrations disable row level security;
alter table documents enable row level security;

-- Public Read Policies
drop policy if exists "Public profiles are viewable by everyone" on profiles;
create policy "Public profiles are viewable by everyone" on profiles for select using (true);

drop policy if exists "Public settings are viewable by everyone" on school_settings;
create policy "Public settings are viewable by everyone" on school_settings for select using (true);

drop policy if exists "Public carousel is viewable by everyone" on carousel_images;
create policy "Public carousel is viewable by everyone" on carousel_images for select using (true);

drop policy if exists "Public social media is viewable by everyone" on social_media;
create policy "Public social media is viewable by everyone" on social_media for select using (true);

drop policy if exists "Public form config is viewable by everyone" on form_config;
create policy "Public form config is viewable by everyone" on form_config for select using (true);



-- Admin Write Policies
drop policy if exists "Admins can update school settings" on school_settings;
create policy "Admins can update school settings" on school_settings for all 
using (auth.role() = 'authenticated') 
with check (auth.role() = 'authenticated');

drop policy if exists "Admins can manage carousel" on carousel_images;
create policy "Admins can manage carousel" on carousel_images for all 
using (auth.role() = 'authenticated') 
with check (auth.role() = 'authenticated');

drop policy if exists "Admins can manage social media" on social_media;
create policy "Admins can manage social media" on social_media for all 
using (auth.role() = 'authenticated') 
with check (auth.role() = 'authenticated');

drop policy if exists "Admins can manage form config" on form_config;
create policy "Admins can manage form config" on form_config for all 
using (auth.role() = 'authenticated') 
with check (auth.role() = 'authenticated');

-- Student Policies
drop policy if exists "Students can view own registration" on registrations;
create policy "Students can view own registration" on registrations for select using (auth.uid() = user_id);

drop policy if exists "Students can update own registration" on registrations;
create policy "Students can update own registration" on registrations for update using (auth.uid() = user_id);

drop policy if exists "Students can insert own registration" on registrations;
create policy "Students can insert own registration" on registrations for insert with check (auth.uid() = user_id);

-- Admin Policy for Registrations
drop policy if exists "Admins can view all registrations" on registrations;

create policy "Admins can view all registrations" on registrations for select using (
  (select role from profiles where id = auth.uid()) = 'admin'
);

drop policy if exists "Admins can update all registrations" on registrations;
create policy "Admins can update all registrations" on registrations for update using (
  (select role from profiles where id = auth.uid()) = 'admin'
);

drop policy if exists "Admins can delete all registrations" on registrations;
create policy "Admins can delete all registrations" on registrations for delete using (
  (select role from profiles where id = auth.uid()) = 'admin'
);

-- Storage Buckets
insert into storage.buckets (id, name, public)
values ('public-assets', 'public-assets', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('private-docs', 'private-docs', false)
on conflict (id) do nothing;

-- Storage Policies
-- Public Assets: Everyone can view, Admin can upload/delete
drop policy if exists "Public Assets Viewable by Everyone" on storage.objects;
create policy "Public Assets Viewable by Everyone"
on storage.objects for select
using ( bucket_id = 'public-assets' );

drop policy if exists "Admins can upload Public Assets" on storage.objects;
create policy "Admins can upload Public Assets"
on storage.objects for insert
with check ( bucket_id = 'public-assets' );
-- Note: We need a way to check admin role here. For now, allowing authenticated users to upload if we can't check role easily in storage policies without a helper function.
-- Ideally: and (select role from profiles where id = auth.uid()) = 'admin'

-- Private Docs: Student can upload/view own, Admin can view all
drop policy if exists "Students can upload own docs" on storage.objects;
create policy "Students can upload own docs"
on storage.objects for insert
with check ( bucket_id = 'private-docs' and (storage.foldername(name))[1] = auth.uid()::text );

drop policy if exists "Students can view own docs" on storage.objects;
create policy "Students can view own docs"
on storage.objects for select
using ( bucket_id = 'private-docs' and (storage.foldername(name))[1] = auth.uid()::text );

drop policy if exists "Admins can view all docs" on storage.objects;
create policy "Admins can view all docs"
on storage.objects for select[plugin:vite:react-babel] D:\spmb\src\pages\admin\StudentList.jsx: Unexpected token (379:0)

  377 |         );
  378 |     }
> 379 |
      | ^
D:/spmb/src/pages/admin/StudentList.jsx:379:0
    at constructor (D:\spmb\node_modules\@babel\parser\lib\index.js:367:19)
    at JSXParserMixin.raise (D:\spmb\node_modules\@babel\parser\lib\index.js:6624:19)
    at JSXParserMixin.unexpected (D:\spmb\node_modules\@babel\parser\lib\index.js:6644:16)
    at JSXParserMixin.parseExprAtom (D:\spmb\node_modules\@babel\parser\lib\index.js:11508:22)
    at JSXParserMixin.parseExprAtom (D:\spmb\node_modules\@babel\parser\lib\index.js:4793:20)
    at JSXParserMixin.parseExprSubscripts (D:\spmb\node_modules\@babel\parser\lib\index.js:11145:23)
    at JSXParserMixin.parseUpdate (D:\spmb\node_modules\@babel\parser\lib\index.js:11130:21)
    at JSXParserMixin.parseMaybeUnary (D:\spmb\node_modules\@babel\parser\lib\index.js:11110:23)
    at JSXParserMixin.parseMaybeUnaryOrPrivate (D:\spmb\node_modules\@babel\parser\lib\index.js:10963:61)
    at JSXParserMixin.parseExprOps (D:\spmb\node_modules\@babel\parser\lib\index.js:10968:23)
    at JSXParserMixin.parseMaybeConditional (D:\spmb\node_modules\@babel\parser\lib\index.js:10945:23)
    at JSXParserMixin.parseMaybeAssign (D:\spmb\node_modules\@babel\parser\lib\index.js:10895:21)
    at JSXParserMixin.parseExpressionBase (D:\spmb\node_modules\@babel\parser\lib\index.js:10848:23)
    at D:\spmb\node_modules\@babel\parser\lib\index.js:10844:39
    at JSXParserMixin.allowInAnd (D:\spmb\node_modules\@babel\parser\lib\index.js:12495:16)
    at JSXParserMixin.parseExpression (D:\spmb\node_modules\@babel\parser\lib\index.js:10844:17)
    at JSXParserMixin.parseStatementContent (D:\spmb\node_modules\@babel\parser\lib\index.js:12971:23)
    at JSXParserMixin.parseStatementLike (D:\spmb\node_modules\@babel\parser\lib\index.js:12843:17)
    at JSXParserMixin.parseStatementListItem (D:\spmb\node_modules\@babel\parser\lib\index.js:12823:17)
    at JSXParserMixin.parseBlockOrModuleBlockBody (D:\spmb\node_modules\@babel\parser\lib\index.js:13392:61)
    at JSXParserMixin.parseBlockBody (D:\spmb\node_modules\@babel\parser\lib\index.js:13385:10)
    at JSXParserMixin.parseBlock (D:\spmb\node_modules\@babel\parser\lib\index.js:13373:10)
    at JSXParserMixin.parseFunctionBody (D:\spmb\node_modules\@babel\parser\lib\index.js:12174:24)
    at JSXParserMixin.parseFunctionBodyAndFinish (D:\spmb\node_modules\@babel\parser\lib\index.js:12160:10)
    at D:\spmb\node_modules\@babel\parser\lib\index.js:13521:12
    at JSXParserMixin.withSmartMixTopicForbiddingContext (D:\spmb\node_modules\@babel\parser\lib\index.js:12477:14)
    at JSXParserMixin.parseFunction (D:\spmb\node_modules\@babel\parser\lib\index.js:13520:10)
    at JSXParserMixin.parseExportDefaultExpression (D:\spmb\node_modules\@babel\parser\lib\index.js:13983:19)
    at JSXParserMixin.parseExport (D:\spmb\node_modules\@babel\parser\lib\index.js:13904:25)
    at JSXParserMixin.parseStatementContent (D:\spmb\node_modules\@babel\parser\lib\index.js:12954:27)
    at JSXParserMixin.parseStatementLike (D:\spmb\node_modules\@babel\parser\lib\index.js:12843:17)
    at JSXParserMixin.parseModuleItem (D:\spmb\node_modules\@babel\parser\lib\index.js:12820:17)
    at JSXParserMixin.parseBlockOrModuleBlockBody (D:\spmb\node_modules\@babel\parser\lib\index.js:13392:36)
    at JSXParserMixin.parseBlockBody (D:\spmb\node_modules\@babel\parser\lib\index.js:13385:10)
    at JSXParserMixin.parseProgram (D:\spmb\node_modules\@babel\parser\lib\index.js:12698:10)
    at JSXParserMixin.parseTopLevel (D:\spmb\node_modules\@babel\parser\lib\index.js:12688:25)
    at JSXParserMixin.parse (D:\spmb\node_modules\@babel\parser\lib\index.js:14568:25)
    at parse (D:\spmb\node_modules\@babel\parser\lib\index.js:14602:38)
    at parser (D:\spmb\node_modules\@babel\core\lib\parser\index.js:41:34)
    at parser.next (<anonymous>)
    at normalizeFile (D:\spmb\node_modules\@babel\core\lib\transformation\normalize-file.js:64:37)
    at normalizeFile.next (<anonymous>)
    at run (D:\spmb\node_modules\@babel\core\lib\transformation\index.js:22:50)
    at run.next (<anonymous>)
    at transform (D:\spmb\node_modules\@babel\core\lib\transform.js:22:33)
    at transform.next (<anonymous>)
    at step (D:\spmb\node_modules\gensync\index.js:261:32)
    at D:\spmb\node_modules\gensync\index.js:273:13
    at async.call.result.err.err (D:\spmb\node_modules\gensync\index.js:223:11)
    at D:\spmb\node_modules\gensync\index.js:189:28
using ( bucket_id = 'private-docs' ); -- Add admin check here ideally

-- Initial Data
insert into school_settings (school_name) values ('SMPIT Ibnu Sina');
