# Hello World App

A minimalist login/registration application built with vanilla HTML, CSS, and JavaScript, powered by Supabase for authentication and user management.

## Version

**Current Version: 0.2.0**

## Features

- **Authentication**: Login and registration via Supabase Auth (email/password)
- **User Profiles**: Stores `username` and `is_admin` in a `profiles` table
- **Admin Panel**: Admins can view all users, toggle admin roles, and delete users
- **Session Persistence**: Auto-restores session on page reload
- **Real-time Auth State**: Reacts to sign-in/sign-out events
- **Version Display**: App version shown in both auth card and dashboard footer

## Quick Start

### 1. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. In the SQL Editor, run the following to create the `profiles` table and a trigger to auto-create profiles on signup:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  username TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read all profiles
CREATE POLICY "Allow authenticated reads"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users to insert their own profile (used by trigger)
CREATE POLICY "Allow profile insert"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy: Allow authenticated users to update their own profile
CREATE POLICY "Allow profile update"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Policy: Allow authenticated users to delete profiles (admin use)
CREATE POLICY "Allow profile delete"
  ON profiles FOR DELETE
  TO authenticated
  USING (true);

-- Function: Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (NEW.id, NEW.email, split_part(NEW.email, '@', 1));
  RETURN NEW;
END;
$$;

-- Trigger: Call function on new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

3. Make your first user an admin by running this manually (replace `<user-uuid>` with the actual user ID from the Supabase Auth page):

```sql
UPDATE profiles SET is_admin = TRUE WHERE id = '<user-uuid>';
```

4. Copy your **Project URL** and **Anon Public Key** from Supabase Dashboard → Settings → API.

### 2. Local Setup

1. Clone this repository:
```bash
git clone https://github.com/allankbtam/vibe-login-app.git
cd vibe-login-app
```

2. Create a `supabase-config.js` file (do NOT commit this — it's in `.gitignore`):
```javascript
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+cjs';

export const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
);

export const APP_VERSION = '0.2.0';
```

3. Open `index.html` in a browser (no build step needed — it's a plain ES module app).

### 3. Make Your First User an Admin

After registering your first account, go to your Supabase Dashboard → Authentication → Users, copy the user's UUID, then run in the SQL Editor:

```sql
UPDATE profiles SET is_admin = TRUE WHERE id = '<user-uuid>';
```

## Project Structure

```
├── index.html          # Main HTML (auth card, dashboard, admin panel)
├── style.css           # All styles (auth, dashboard, admin, modal)
├── app.js              # Authentication, session, admin logic (ES Module)
├── supabase-config.js  # Supabase client + version (YOU CREATE THIS — not committed)
├── package.json        # Project metadata + Playwright dev dependency
├── playwright.config.js # Playwright E2E test config
├── tests/
│   └── auth.spec.ts   # E2E tests for login, registration, session
└── .gitignore          # Excludes supabase-config.js and other sensitive files
```

## E2E Tests (Playwright)

This project includes Playwright tests to verify authentication flows.

### Setup

```bash
npm install
```

### Run Tests

```bash
# Run with UI Mode (shows browser + report)
npx playwright test --ui

# Run headless
npx playwright test

# Run with video recording on failure
npx playwright test --reporter=html
```

> **Note:** Tests require a running Supabase backend with valid credentials configured in `tests/auth.spec.ts`.

## Environment Variables

This app does **not** use `.env` files. Instead, you create a `supabase-config.js` with your credentials directly. This file is excluded from Git via `.gitignore`.

## Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES Modules)
- **Backend**: Supabase (Auth, PostgreSQL)
- **Testing**: Playwright
- **No build tools** — runs directly in the browser

## License

MIT