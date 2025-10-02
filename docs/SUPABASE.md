Supabase integration

Environment variables (create a .env file at project root):

VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key

SQL to create products table:

create table if not exists public.products (
id uuid primary key default gen_random_uuid(),
name text not null,
description text,
price numeric(10,2) not null,
image text,
category text not null default 'classic',
created_at timestamp with time zone default now()
);

alter table public.products enable row level security;
create policy "Public can read products" on public.products for select using (true);

Optional seed data:

insert into public.products (name, description, price, image, category) values
('Chocolate Chip Cookie','Classic chocolate chip cookies made with premium chocolate', 2.99,'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80','classic'),
('Double Chocolate Cookie','Rich chocolate cookies with chocolate chunks', 3.49,'https://images.unsplash.com/photo-1618923850107-d1a234d7a73a?w=800&q=80','chocolate'),
('Oatmeal Raisin Cookie','Hearty oatmeal cookies with plump raisins', 2.79,'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=800&q=80','classic'),
('Peanut Butter Cookie','Soft peanut butter cookies with a sweet and salty flavor', 3.29,'https://images.unsplash.com/photo-1584365685547-9a5fb6f3a70c?w=800&q=80','nutty');
