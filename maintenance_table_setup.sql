-- Create maintenance table for Hero and Gallery images
CREATE TABLE IF NOT EXISTS maintenance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('Hero', 'Gallery')),
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE maintenance ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read maintenance images (public access)
CREATE POLICY "Maintenance images are viewable by everyone" ON maintenance
  FOR SELECT USING (true);

-- Create a policy that allows authenticated users to insert (for admin)
CREATE POLICY "Authenticated users can insert maintenance" ON maintenance
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create a policy that allows authenticated users to update (for admin)
CREATE POLICY "Authenticated users can update maintenance" ON maintenance
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create a policy that allows authenticated users to delete (for admin)
CREATE POLICY "Authenticated users can delete maintenance" ON maintenance
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_maintenance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_maintenance_updated_at BEFORE UPDATE ON maintenance
    FOR EACH ROW EXECUTE FUNCTION update_maintenance_updated_at();

