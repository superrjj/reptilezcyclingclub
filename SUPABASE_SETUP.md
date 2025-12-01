# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in your project details:
   - Name: `reptilez-cycling-club` (or your preferred name)
   - Database Password: (choose a strong password)
   - Region: (choose closest to your users)

## 2. Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (this is your `REACT_APP_SUPABASE_URL`)
   - **anon/public key** (this is your `REACT_APP_SUPABASE_ANON_KEY`)

## 3. Set Up Environment Variables

1. Create a `.env` file in the root of your project (copy from `.env.example`)
2. Add your Supabase credentials:

```env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

3. **Important**: Never commit your `.env` file to git! It's already in `.gitignore`

## 4. Create the Members Table

In your Supabase dashboard, go to **SQL Editor** and run this SQL:

```sql
-- Create members table
CREATE TABLE members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  role_type TEXT NOT NULL CHECK (role_type IN ('Captain', 'Lead Rider', 'Rider')),
  description TEXT,
  image_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read members (public access)
CREATE POLICY "Members are viewable by everyone" ON members
  FOR SELECT USING (true);

-- Create a policy that allows authenticated users to insert (optional, for admin)
CREATE POLICY "Authenticated users can insert members" ON members
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create a policy that allows authenticated users to update (optional, for admin)
CREATE POLICY "Authenticated users can update members" ON members
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create a policy that allows authenticated users to delete (optional, for admin)
CREATE POLICY "Authenticated users can delete members" ON members
  FOR DELETE USING (auth.role() = 'authenticated');
```

## 5. Insert Sample Data (Optional)

```sql
INSERT INTO members (name, role, role_type, description, image_url) VALUES
  ('John Harvee Quirido', 'Rider', 'Rider', 'Road Bike', '/harvee.jpg'),
  ('Alex Johnson', 'Club Captain', 'Captain', 'Years Riding: 5', 'https://example.com/image1.jpg'),
  ('Maria Garcia', 'Lead Rider', 'Lead Rider', 'Route: Mountain Pass', 'https://example.com/image2.jpg');
```

## 6. Set Up Authentication (Optional)

If you want to use authentication:

1. Go to **Authentication** → **Providers** in Supabase
2. Enable **Email** provider
3. Configure email templates if needed
4. Users can now sign up and log in through the LoginDialog component

## 7. Enable Supabase in the App

In `src/components/Members/MembersPage.jsx`, change:

```javascript
const [useSupabase, setUseSupabase] = useState(false);
```

to:

```javascript
const [useSupabase, setUseSupabase] = useState(true);
```

## 8. Test the Connection

1. Start your development server: `npm start`
2. Navigate to the Members page
3. Check the browser console for any errors
4. Members should load from Supabase if configured correctly

## Troubleshooting

- **"Supabase URL or Anon Key is missing"**: Make sure your `.env` file exists and has the correct variable names
- **"Error fetching members"**: Check that your table name is `members` and columns match the expected structure
- **CORS errors**: Make sure your Supabase project allows requests from `localhost:3000` (should be enabled by default)

## Next Steps

- Add more tables (events, posts, etc.)
- Set up file storage for member images
- Configure authentication policies
- Add admin dashboard

