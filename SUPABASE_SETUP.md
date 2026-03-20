# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Note your **Project URL** and **anon public key** (Settings → API)

---

## 2. Run Migrations (in order)

Open **SQL Editor** in your Supabase dashboard and run each file in order:

```
backend/supabase/migrations/001_initial_schema.sql
backend/supabase/migrations/002_storage_and_policies.sql
```

---

## 3. Create Storage Bucket

If migration 002 fails on the bucket insert (some plans restrict it via SQL):

1. Go to **Storage** → **New Bucket**
2. Name: `clinic-assets`
3. Toggle **Public bucket**: ON
4. Click Create

Then re-run only the **policy** sections of `002_storage_and_policies.sql`.

---

## 4. Create Your First Admin User

1. Go to **Authentication** → **Users** → **Add User**
2. Enter email + password
3. Copy the user's **UUID**
4. Run in SQL Editor:

```sql
INSERT INTO admin (user_id, role) VALUES ('<paste-uuid-here>', 'admin');
```

---

## 5. Set Environment Variables

### Web (PWA)

Create `web/.env` (copy from `web/.env.example`):

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### React Native (mobile)

Create `frontend/.env`:

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## 6. Verify Setup

Run the web app:

```bash
cd web
npm install
npm run dev
```

Sign in → you should land on the Dashboard. Content Library will be empty until you seed data — see Step 7.

---

## 7. Seed Sample Content

Run `backend/supabase/migrations/003_seed_content.sql` in the SQL Editor to populate the content library with sample posts.
