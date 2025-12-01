# Step-by-Step Guide: Supabase Configuration sa React.js

## 📋 Overview
Ito ang complete guide para ma-setup ang Supabase sa React.js application mo.

---

## Step 1: Create Supabase Account at Project

### 1.1 Sign Up / Login
1. Pumunta sa [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** o **"Sign In"** kung may account ka na
3. Sign up gamit ang:
   - GitHub account, o
   - Email at password

### 1.2 Create New Project
1. After login, click **"New Project"** button
2. Fill in ang project details:
   - **Name**: `reptilez-cycling-club` (o kahit anong name)
   - **Database Password**: 
     - Mag-generate ng strong password
     - **IMPORTANT**: I-save mo ito! Kailangan mo ito later
     - Example: `MyStr0ng!P@ssw0rd2024`
   - **Region**: Piliin ang closest region (e.g., `Southeast Asia (Singapore)`)
   - **Pricing Plan**: Piliin **Free** (sapat na para sa start)
3. Click **"Create new project"**
4. Wait ng 2-3 minutes habang nagse-setup ang project

---

## Step 2: Get Your API Keys

### 2.1 Access Project Settings
1. Sa Supabase dashboard, click ang **Settings** icon (gear icon) sa left sidebar
2. Click **"API"** sa settings menu

### 2.2 Copy API Credentials
Makikita mo ang dalawang important values:

1. **Project URL**
   - Format: `https://xxxxxxxxxxxxx.supabase.co`
   - Example: `https://qrlqnmyrxsizdlnvyili.supabase.co`
   - **Copy ito** - ito ang `REACT_APP_SUPABASE_URL`

2. **anon public key**
   - Long string na may letters at numbers
   - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Copy ito** - ito ang `REACT_APP_SUPABASE_ANON_KEY`

> ⚠️ **IMPORTANT**: Never share ang `service_role` key publicly! Gamitin lang ang `anon` key sa frontend.

---

## Step 3: Create .env File sa React Project

### 3.1 Create .env File
1. Sa root folder ng React project mo (same level as `package.json`)
2. Create new file na name: `.env`
3. **WARNING**: Make sure walang space sa filename - dapat `.env` lang, hindi `.env.txt`

### 3.2 Add Environment Variables
Open ang `.env` file at i-add ang:

```env
REACT_APP_SUPABASE_URL=https://qrlqnmyrxsizdlnvyili.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFybHFubXlyeHNpemRsbnZ5aWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4NzY4MDAsImV4cCI6MjA0ODQ1MjgwMH0.xxxxxxxxxxxxx
```

**Replace:**
- `https://qrlqnmyrxsizdlnvyili.supabase.co` → Your actual Project URL
- `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` → Your actual anon key

### 3.3 Verify .env File
Dapat ganito ang structure:
```
cycling-viewer/
├── .env                 ← Dito dapat
├── .gitignore          ← Make sure .env is in .gitignore
├── package.json
├── public/
└── src/
```

### 3.4 Check .gitignore
Make sure ang `.env` file ay nasa `.gitignore` para hindi ma-commit sa git:

```gitignore
# .env file
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

---

## Step 4: Create Database Table

### 4.1 Open SQL Editor
1. Sa Supabase dashboard, click **"SQL Editor"** sa left sidebar
2. Click **"New query"** button

### 4.2 Run SQL Script
1. Open ang `supabase_setup.sql` file sa project folder mo
2. Copy lahat ng contents
3. Paste sa SQL Editor sa Supabase
4. Click **"Run"** button (o press `Ctrl+Enter` / `Cmd+Enter`)

### 4.3 Verify Table Creation
1. After running, pumunta sa **"Table Editor"** sa left sidebar
2. Dapat makita mo na ang `members` table
3. Click ang `members` table para makita ang columns at sample data

---

## Step 5: Test Connection sa React App

### 5.1 Restart Development Server
**IMPORTANT**: After creating `.env` file, kailangan i-restart ang dev server:

1. Stop ang current server (press `Ctrl+C` sa terminal)
2. Start ulit:
   ```bash
   npm start
   ```

### 5.2 Check Browser Console
1. Open ang app sa browser (`http://localhost:3000`)
2. Open Developer Tools (F12)
3. Check ang Console tab
4. Dapat walang error na "supabaseUrl is required"
5. Kung may error, check:
   - Naka-restart na ba ang dev server?
   - Tama ba ang format ng `.env` file?
   - May typo ba sa variable names?

### 5.3 Test Members Page
1. Navigate sa Members page (`/members`)
2. Dapat makita mo ang members from Supabase
3. Try ang search at filter functionality

---

## Step 6: Enable Supabase sa MembersPage

### 6.1 Update MembersPage Component
1. Open `src/components/Members/MembersPage.jsx`
2. Hanapin ang line 10:
   ```javascript
   const [useSupabase, setUseSupabase] = useState(false);
   ```
3. Change to:
   ```javascript
   const [useSupabase, setUseSupabase] = useState(true);
   ```

### 6.2 Save at Test
1. Save ang file
2. Refresh ang browser
3. Dapat mag-load na ang members from Supabase

---

## Step 7: Set Up Authentication (Optional)

### 7.1 Enable Email Auth Provider
1. Sa Supabase dashboard, pumunta sa **"Authentication"** → **"Providers"**
2. Enable ang **"Email"** provider
3. Configure email templates kung gusto mo (optional)

### 7.2 Test Authentication
1. Sa React app, click **"LOGIN"**
2. Try mag-sign up ng new user
3. O mag-login gamit existing credentials

---

## Step 8: Verify Everything Works

### Checklist:
- [ ] `.env` file created with correct values
- [ ] Dev server restarted after creating `.env`
- [ ] No errors sa browser console
- [ ] `members` table created sa Supabase
- [ ] Members page naglo-load ng data from Supabase
- [ ] Search functionality working
- [ ] Filter functionality working
- [ ] Admin login still working (`adminrcc` / `rccadmin2020`)

---

## Troubleshooting

### Problem: "supabaseUrl is required" error
**Solution:**
1. Check kung may `.env` file sa root folder
2. Verify ang variable names: `REACT_APP_SUPABASE_URL` at `REACT_APP_SUPABASE_ANON_KEY`
3. Restart ang dev server
4. Check kung may typo sa values

### Problem: "Failed to fetch" error
**Solution:**
1. Check kung tama ang Project URL
2. Verify na may internet connection
3. Check kung naka-enable ang Row Level Security (RLS) policies

### Problem: Table not found
**Solution:**
1. Verify na na-run mo ang SQL script
2. Check sa Table Editor kung may `members` table
3. Verify ang table name sa code (dapat `members`)

### Problem: No data showing
**Solution:**
1. Check kung may data sa `members` table (sa Supabase Table Editor)
2. Verify na `useSupabase` is set to `true` sa MembersPage
3. Check browser console para sa errors
4. Verify ang RLS policies (dapat may "Members are viewable by everyone" policy)

### Problem: Environment variables not loading
**Solution:**
1. Make sure ang variable names ay nagsisimula sa `REACT_APP_`
2. Restart ang dev server
3. Clear browser cache
4. Check kung may syntax error sa `.env` file (walang spaces, quotes, etc.)

---

## Next Steps

### Add More Tables
Puwede ka nang mag-add ng iba pang tables:
- `events` - Para sa events
- `posts` - Para sa posts/blog
- `users` - Para sa user profiles

### Set Up File Storage
Para sa images:
1. Pumunta sa **"Storage"** sa Supabase
2. Create bucket para sa member photos
3. Update ang code para mag-upload ng images

### Add Real-time Features
Puwede mo i-enable ang real-time updates:
1. Enable Realtime sa table settings
2. Subscribe sa changes sa React app

---

## Quick Reference

### Environment Variables Format
```env
REACT_APP_SUPABASE_URL=your-project-url
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### Important Files
- `.env` - Environment variables (hindi dapat ma-commit)
- `src/lib/supabase.js` - Supabase client configuration
- `src/contexts/AuthContext.jsx` - Authentication context
- `src/services/membersService.js` - Database service functions

### Supabase Dashboard Links
- **API Settings**: `https://supabase.com/dashboard/project/[project-id]/settings/api`
- **SQL Editor**: `https://supabase.com/dashboard/project/[project-id]/sql/new`
- **Table Editor**: `https://supabase.com/dashboard/project/[project-id]/editor`

---

## Summary

1. ✅ Create Supabase account at project
2. ✅ Get API keys (URL at anon key)
3. ✅ Create `.env` file with credentials
4. ✅ Run SQL script para sa `members` table
5. ✅ Restart dev server
6. ✅ Enable Supabase sa MembersPage (`useSupabase = true`)
7. ✅ Test ang connection

Kung may questions o issues, check ang troubleshooting section o i-debug gamit ang browser console!

