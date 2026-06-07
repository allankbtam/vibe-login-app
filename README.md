# Hello World App - Supabase Authentication

A beautiful, modern login/registration web application powered by **Supabase** for real authentication and database storage.

## ✨ Features

- **Register** - Create a new account with email and password
- **Login** - Sign in with your credentials
- **Logout** - Secure session management
- **Session Persistence** - Stay logged in across page refreshes
- **Real-time Auth State** - Automatically syncs across browser tabs
- **Beautiful UI** - Modern gradient design with smooth animations

## 📁 Project Structure

```
├── index.html          # Main HTML structure (login, register, dashboard)
├── style.css           # Styles and animations
├── app.js              # Authentication logic with Supabase
├── supabase-config.js  # Supabase client configuration
└── README.md           # This file
```

## 🚀 Quick Start

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up or log in
2. Click **"New Project"**
3. Fill in:
   - **Organization**: Choose or create one
   - **Name**: e.g., `hello-world-app`
   - **Database Password**: Choose a strong password
   - **Region**: Choose the closest region to your users
4. Click **"Create new project"** and wait for it to initialize

### Step 2: Get Your API Credentials

1. In your Supabase Dashboard, go to **Project Settings** → **API**
2. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...` or `sb_publishable_...`)

### Step 3: Configure the App

Open `supabase-config.js` and replace the placeholder values with your credentials:

```js
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

### Step 4: Create the Users Table (Optional)

If you want to store additional user data, run this SQL in the Supabase Dashboard:

1. Go to **SQL Editor** in your Supabase Dashboard
2. Run the following query:

```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own data
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Allow the auth system to insert new users
CREATE POLICY "Enable insert for authenticated users"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);
```

> **Note:** The app will still work without this table (authentication is handled by Supabase Auth). The `users` table is optional for storing extra data.

### Step 5: Run the App

Simply open `index.html` in your web browser. No build step or server required!

For the best experience, you can use a local server:

```bash
# Using Python
python3 -m http.server 3000

# Using Node.js
npx serve .

# Then open http://localhost:3000
```

## 🔧 How It Works

| File | Purpose |
|------|---------|
| `index.html` | UI structure with login form, register form, and dashboard |
| `style.css` | Modern gradient background, card layout, animations |
| `supabase-config.js` | Initializes the Supabase client with your credentials |
| `app.js` | Handles register, login, logout, session checks, and auth state changes |

## 📝 Authentication Flow

1. **Register**: User enters email + password → Supabase creates the account → Optional: saves extra data to `users` table
2. **Login**: User enters email + password → Supabase validates credentials → Shows dashboard
3. **Session Check**: On page load, checks for an active Supabase session → Auto-logs in if valid
4. **Logout**: Clears the Supabase session → Returns to login screen

## 🌐 Deployment

This is a static HTML/JS app, so it can be deployed anywhere:

- **GitHub Pages** - Push to a repository and enable Pages
- **Netlify** - Drag and drop the folder
- **Vercel** - Import from GitHub
- **Supabase Storage** - Host the static files

## ⚠️ Security Notes

- The **anon/public key** is safe to expose in client-side code. Supabase uses Row Level Security (RLS) to protect data.
- **Never** expose your `service_role` key in client-side code.
- Always enable **Row Level Security** on your database tables.

## 📄 License

MIT License - Feel free to use this for your own projects!