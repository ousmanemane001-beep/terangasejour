INSERT INTO storage.buckets (id, name, public) VALUES ('destinations', 'destinations', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read destinations" ON storage.objects FOR SELECT TO public USING (bucket_id = 'destinations');
CREATE POLICY "Auth upload destinations" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'destinations');