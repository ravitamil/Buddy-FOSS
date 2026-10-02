-- Create the storage bucket for group receipts if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('group-receipts', 'group-receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the group-receipts bucket

-- Allow public read access to receipts
CREATE POLICY "Public Read Access for group-receipts" ON storage.objects
FOR SELECT
USING (bucket_id = 'group-receipts');

-- Allow authenticated users to upload receipts
CREATE POLICY "Authenticated users can upload group receipts" ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'group-receipts'
    AND auth.role() = 'authenticated'
);

-- Allow users to delete their own uploaded receipts
CREATE POLICY "Users can delete their own uploaded receipts" ON storage.objects
FOR DELETE
USING (
    bucket_id = 'group-receipts'
    AND auth.uid() = owner
);
