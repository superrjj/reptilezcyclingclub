-- Create members table for Reptilez Cycling Club
CREATE TABLE IF NOT EXISTS members (
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

-- Insert sample data (you can modify these or add more)
INSERT INTO members (name, role, role_type, description, image_url) VALUES
  ('John Harvee Quirido', 'Rider', 'Rider', 'Road Bike', '/harvee.jpg'),
  ('Alex Johnson', 'Club Captain', 'Captain', 'Years Riding: 5', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxVIm-tOwfKxKZb9CigmRG8dws9U26SokiEo7cjzpjJmzrMt1htXUnHWoZb3ctMexyG5pEQufjpC7aQZPOHYfy35RkBbMo4n2ZQrn1cw68MbwLr42aiBpzGw5tKt9kCNASFRhbZ_tqygAzHV4KLgbOpQwtAf0pvJJ9WMqSsfXT8qGwnVndPsRuSDDCJTf1Dfpq0OJLCHtp9qwVLgXi9cnIEReoLdIgYMbwpOywBc9XTipPpFJso9ZvOF4KNT5IHhUIByRMqa8QY30'),
  ('Maria Garcia', 'Lead Rider', 'Lead Rider', 'Route: Mountain Pass', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDx-5yTvRRd7zDxEM_NRv1FePaTo9Jiq_m0xWR27gY9B-k4k6BExMp1ItEy4YzTyMMLQRcXLC3LpZnlpUhlghi-MMX5sUcmQhhzBnS2fzrWpG1lJAPosrtRiZ_Le4OgGOJBeLDzW2li6a2jOvr4fkchrbqGi8L2HIAtY7-CppSRr85yhCCKIrhYajk0QcCMDFSvceHtSNghaFVQeeIDK8GNPJjhsStSC3MoIxMzOM4ETpk-9RiVRiJCbKqu4A5er_nFY8U0aslIZ-8'),
  ('Chen Wei', 'Rider', 'Rider', 'Years Riding: 2', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCP5VyM2PTAflMyUu2kz_nXJpAr2YwUfird43-MDL7OloIAwR7KNbWzC3K5LQyrW09-O1kAocgRp5by_B3ZzknjACJhr4_vb1FL4cNJGAsJRf37OX6bDqTXkSnh9UJaNGluHiHE8VRSU8aosgRxni4SbWQbocE4Sp5QrSqjRjKWSmJhzBBh-eac0hSLY4yCrHFTDlK2gzw9PF96i2r5SmnxNOZjkSkrdYK2tPyOjj45r1kkJr8kUspwYa9f1xTwRbZ8VyoFh0A3cJM'),
  ('Samira Khan', 'Social Coordinator', 'Rider', 'Organizing our best events', 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6iMmQH9G1zsOw7C15a-Yu_1V1Zy4WPktTwWRDFsh18I4NYD69XloSDl8IGoCPoqZwF5LavcLIVoRX7NjVcJBBrnUDH3W371bGNRKwqy-xLLXXvdTcERSpnt8SrVNPLlkNq4P5_r77LGaSMZGiqohRtAflDsPgHteKjTWb_NbU72H3NIkhxi2JGldg89er_eLIQITACLmm2Rdxd-ydv2PCHDzNm7pMSd6pGe8qU2-uU7OZ1JBN7Q9Yi9mXjnwqAGt0nRa7W0Qzzks'),
  ('David Lee', 'Rider', 'Rider', 'Years Riding: 8', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnt9gSyJ9fdbbk0USbWpJOYx9l7zVcQku6bn6irUM6eYciOpaRzLzisq4ZBEi9S_pEzOIlA6g_0WdaI5_aqaiTW-sfgGczUcufViykMdPmPoJVU8kVmTxq0LA0gxljrDOKhNdVhxBUpqtCvkI--S-rVe3Nuel9O4TX8AeeS2wB2oRPob8qt8w0db0UcB56UJId8lRfRidfHNvH5XoO_SicGSJSLpvypgYBegQVGgZW7u_-EMxQU9-ArXM7NdUPX46MPF6fgVzO9G8'),
  ('Chloe Dubois', 'Rider', 'Rider', 'Loves a good climb', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAietRtPwBKmNWqS6VgfSz9T9MpiwQfioTIvlQif-mbJ-FJW6Tw6SiR-_mztfmdOHk4O8IbycyDa3LbrUpsYdtcRy62JQ-1c6cuc14_uZQqSESoImZUvujKKz56shNJYVsrduJLatd5TI72vdhtwKtn7_0tyNAVTtR-G7SCLFiBC14lYMcd67L_WnzAohNyrpKzPKZkWF4Ne7PCHrcASUMS-sSoWYUEUIHx0ssl60xPy8N7WZMO74KUOQvRO9z3FxTl5xJ1p5eud74'),
  ('Ben Carter', 'Founder', 'Captain', 'Years Riding: 15', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzuGOTQRvYUC01OCAXxLbHOeyJ_JmfJ1YLPnla3HmN2Hlb6F7w2Z1ChkH037va9-9_iDvKT_W1eI0SSSpr-kGh2g1Y0Y9rqrDzfTMTfh76PJtTOq9-n9OEUxEKGMum8-ZN4YY1v6NkSR0UL6o2i3LIPZN7t6kEzGWLFyDtzGkHUTiQgSnOh94W_fiPgk73aBwwyRAmGvBYhJvukT_I7qZimp2JaqU0jL_KTqGQtXj7hz45EaitNG7Zvoy-adm2xe9sL8mLsPM_0-0'),
  ('Sofia Rossi', 'Lead Rider', 'Lead Rider', 'Route: Coastal Cruise', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCp0zm9TuKCIHIPI_rCEb0ONB5iuQhhHw0CU3Ed1z4hSRcjVz05HMlpGo_SXk_2QA-f06G1eXST2HRFaQ4WYxj383gkK6VJG-yOGTuraXB-z7EyQ1VQ_6HdTRdjUL-ZzsatEIgeX1b8sXw4G4tpT8nHP_IoAZFxTLp8sTVWxPYvoTiCAvduWpTkHS2u17S6vc-qdUlz1Qfs_k2LgjkPNrBxIoWE-IqGYlP4c0HhUSSFhg24cf7NltAMC99E30z2XDl-QC3PHaOuFHI');

