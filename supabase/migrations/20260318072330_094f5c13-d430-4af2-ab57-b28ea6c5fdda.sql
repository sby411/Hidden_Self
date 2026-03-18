
-- Create test_submissions table
CREATE TABLE public.test_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  instagram_id TEXT NOT NULL,
  result_type TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  user_agent TEXT,
  session_id TEXT,
  payment_status TEXT NOT NULL DEFAULT 'free'
);

-- Enable RLS
ALTER TABLE public.test_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public service, no auth required for end users)
CREATE POLICY "Anyone can insert test_submissions"
ON public.test_submissions FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only authenticated users can select (for admin dashboard)
CREATE POLICY "Authenticated users can select test_submissions"
ON public.test_submissions FOR SELECT
TO authenticated
USING (true);
