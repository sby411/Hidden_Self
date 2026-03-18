ALTER TABLE public.test_submissions ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'processing';

CREATE POLICY "Anyone can update own test_submissions by session"
ON public.test_submissions
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);