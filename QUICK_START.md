# 🚀 Quick Start: Supabase Setup (5 Minutes)

## Fast Track Setup

### 1. Get API Keys (2 minutes)
1. Go to [supabase.com](https://supabase.com) → Login
2. Click your project → **Settings** → **API**
3. Copy:
   - **Project URL** → `REACT_APP_SUPABASE_URL`
   - **anon public key** → `REACT_APP_SUPABASE_ANON_KEY`

### 2. Create .env File (1 minute)
Sa root folder, create `.env`:
```env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Create Database Table (1 minute)
1. Supabase Dashboard → **SQL Editor** → **New query**
2. Copy contents ng `supabase_setup.sql`
3. Paste at click **Run**

### 4. Enable sa App (1 minute)
1. Open `src/components/Members/MembersPage.jsx`
2. Change line 10:
   ```javascript
   const [useSupabase, setUseSupabase] = useState(true);
   ```

### 5. Restart & Test
```bash
# Stop server (Ctrl+C)
npm start
```

✅ Done! Check `/members` page para makita ang data from Supabase.

---

**Full guide**: See `SUPABASE_REACT_SETUP.md` para sa detailed instructions.

