-- Create posts table for Reptilez Cycling Club
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Announcements', 'Race Reports', 'Club News')),
  featured_image TEXT,
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published')),
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read published posts (public access)
CREATE POLICY "Published posts are viewable by everyone" ON posts
  FOR SELECT USING (status = 'Published');

-- Create a policy that allows authenticated users to read all posts (for admin)
CREATE POLICY "Authenticated users can view all posts" ON posts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create a policy that allows authenticated users to insert (for admin)
CREATE POLICY "Authenticated users can insert posts" ON posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create a policy that allows authenticated users to update (for admin)
CREATE POLICY "Authenticated users can update posts" ON posts
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create a policy that allows authenticated users to delete (for admin)
CREATE POLICY "Authenticated users can delete posts" ON posts
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

