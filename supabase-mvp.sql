-- ============================================
-- QR Chef MVP Veritabanı Şeması
-- Hedef: 2-3 restoran ile ücretsiz test
-- Platform: Supabase (PostgreSQL)
-- ============================================

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- ============================================
-- 1. ORGANIZATIONS (Restoranlar)
-- ============================================
create table organizations (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    subdomain text unique not null,
    owner_name text,
    currency text default '₺',
    business_phone text,
    address text,
    city text,
    state text,
    zipcode text,
    logo_url text,
    cover_url text,
    primary_color text default '#e11d48',
    wifi_name text,
    wifi_password text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- ============================================
-- 2. ORGANIZATION_MEMBERS (Kullanıcı-Restoran bağlantısı)
-- ============================================
create table organization_members (
    id uuid primary key default uuid_generate_v4(),
    organization_id uuid references organizations(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    role text not null default 'owner',
    created_at timestamp with time zone default now(),
    unique(organization_id, user_id)
);

-- ============================================
-- 3. MENUS (Menüler)
-- ============================================
create table menus (
    id uuid primary key default uuid_generate_v4(),
    organization_id uuid references organizations(id) on delete cascade,
    name text not null,
    description text,
    image_url text,
    is_listed boolean default true,
    layout text default 'grid',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- ============================================
-- 4. CATEGORIES (Kategoriler)
-- ============================================
create table categories (
    id uuid primary key default uuid_generate_v4(),
    menu_id uuid references menus(id) on delete cascade,
    name text not null,
    description text,
    display_order integer default 0,
    is_active boolean default true,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- ============================================
-- 5. ITEMS (Ürünler)
-- ============================================
create table items (
    id uuid primary key default uuid_generate_v4(),
    category_id uuid references categories(id) on delete cascade,
    name text not null,
    description text,
    price text not null,
    image_url text,
    allergens text[],
    calories integer,
    is_available boolean default true,
    is_featured boolean default false,
    display_order integer default 0,
    tags text[],
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- ============================================
-- 6. MENU_VIEWS (Basit Analitik)
-- ============================================
create table menu_views (
    id uuid primary key default uuid_generate_v4(),
    menu_id uuid references menus(id) on delete cascade,
    device_type text,
    created_at timestamp with time zone default now()
);

-- ============================================
-- INDEXES (Performans)
-- ============================================
create index idx_org_members_user on organization_members(user_id);
create index idx_org_members_org on organization_members(organization_id);
create index idx_menus_org on menus(organization_id);
create index idx_categories_menu on categories(menu_id);
create index idx_items_category on items(category_id);
create index idx_menu_views_menu on menu_views(menu_id);
create index idx_organizations_subdomain on organizations(subdomain);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
alter table organizations enable row level security;
alter table organization_members enable row level security;
alter table menus enable row level security;
alter table categories enable row level security;
alter table items enable row level security;
alter table menu_views enable row level security;

-- Organzisyon: Kendi restoranını görebilir/düzenleyebilir
create policy "org_select" on organizations for select
    using (
        id in (select organization_id from organization_members where user_id = auth.uid())
    );

create policy "org_update" on organizations for update
    using (
        id in (select organization_id from organization_members where user_id = auth.uid())
    );

-- Herkes subdomain ile restoran bulabilsin (public menü görüntüleme için)
create policy "org_public_select" on organizations for select
    using (true);

-- Organization Members: Kendi üyeliğini görebilir
create policy "members_select" on organization_members for select
    using (user_id = auth.uid());

-- Menüler: Sahibi CRUD yapabilir
create policy "menus_select_owner" on menus for select
    using (
        organization_id in (select organization_id from organization_members where user_id = auth.uid())
    );

-- Herkes yayındaki menüleri görebilir (QR tarama için)
create policy "menus_public_select" on menus for select
    using (is_listed = true);

create policy "menus_insert" on menus for insert
    with check (
        organization_id in (select organization_id from organization_members where user_id = auth.uid())
    );

create policy "menus_update" on menus for update
    using (
        organization_id in (select organization_id from organization_members where user_id = auth.uid())
    );

create policy "menus_delete" on menus for delete
    using (
        organization_id in (select organization_id from organization_members where user_id = auth.uid())
    );

-- Kategoriler: Menü sahibi CRUD yapabilir
create policy "categories_select_owner" on categories for select
    using (
        menu_id in (
            select m.id from menus m
            join organization_members om on m.organization_id = om.organization_id
            where om.user_id = auth.uid()
        )
    );

-- Herkes yayındaki menülerin kategorilerini görebilir
create policy "categories_public_select" on categories for select
    using (
        menu_id in (select id from menus where is_listed = true)
    );

create policy "categories_insert" on categories for insert
    with check (
        menu_id in (
            select m.id from menus m
            join organization_members om on m.organization_id = om.organization_id
            where om.user_id = auth.uid()
        )
    );

create policy "categories_update" on categories for update
    using (
        menu_id in (
            select m.id from menus m
            join organization_members om on m.organization_id = om.organization_id
            where om.user_id = auth.uid()
        )
    );

create policy "categories_delete" on categories for delete
    using (
        menu_id in (
            select m.id from menus m
            join organization_members om on m.organization_id = om.organization_id
            where om.user_id = auth.uid()
        )
    );

-- Items: Menü sahibi CRUD yapabilir
create policy "items_select_owner" on items for select
    using (
        category_id in (
            select c.id from categories c
            join menus m on c.menu_id = m.id
            join organization_members om on m.organization_id = om.organization_id
            where om.user_id = auth.uid()
        )
    );

-- Herkes yayındaki menülerin ürünlerini görebilir
create policy "items_public_select" on items for select
    using (
        category_id in (
            select c.id from categories c
            join menus m on c.menu_id = m.id
            where m.is_listed = true
        )
    );

create policy "items_insert" on items for insert
    with check (
        category_id in (
            select c.id from categories c
            join menus m on c.menu_id = m.id
            join organization_members om on m.organization_id = om.organization_id
            where om.user_id = auth.uid()
        )
    );

create policy "items_update" on items for update
    using (
        category_id in (
            select c.id from categories c
            join menus m on c.menu_id = m.id
            join organization_members om on m.organization_id = om.organization_id
            where om.user_id = auth.uid()
        )
    );

create policy "items_delete" on items for delete
    using (
        category_id in (
            select c.id from categories c
            join menus m on c.menu_id = m.id
            join organization_members om on m.organization_id = om.organization_id
            where om.user_id = auth.uid()
        )
    );

-- Menu Views: Herkes yazabilir (anonim analitik)
create policy "views_insert" on menu_views for insert
    with check (true);

create policy "views_select_owner" on menu_views for select
    using (
        menu_id in (
            select m.id from menus m
            join organization_members om on m.organization_id = om.organization_id
            where om.user_id = auth.uid()
        )
    );

-- ============================================
-- TRIGGER: Yeni kullanıcı kayıt olunca restoran oluştur
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
declare
    org_id uuid;
begin
    -- Yeni organizasyon oluştur
    insert into public.organizations (
        name,
        subdomain,
        owner_name
    ) values (
        coalesce(new.raw_user_meta_data->>'business_name', 'Restoranım'),
        coalesce(
            lower(regexp_replace(new.raw_user_meta_data->>'business_name', '[^a-zA-Z0-9]', '-', 'g')),
            'restoran-' || substr(new.id::text, 1, 8)
        ),
        coalesce(new.raw_user_meta_data->>'owner_name', '')
    )
    returning id into org_id;

    -- Kullanıcıyı owner olarak ekle
    insert into public.organization_members (organization_id, user_id, role)
    values (org_id, new.id, 'owner');

    return new;
end;
$$ language plpgsql security definer;

-- Trigger
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- ============================================
-- STORAGE: Görsel yükleme bucket'ı
-- ============================================
-- Bu kısmı Supabase Dashboard > Storage bölümünden yapın:
-- 1. "menu-images" adında public bucket oluşturun
-- 2. Allowed MIME types: image/jpeg, image/png, image/webp
-- 3. Max file size: 5MB

-- ============================================
-- 8. QR_TABLES (Masalar / QR Kodlar)
-- ============================================
create table qr_tables (
    id uuid primary key default uuid_generate_v4(),
    organization_id uuid references organizations(id) on delete cascade,
    name text not null,
    views integer default 0,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);
