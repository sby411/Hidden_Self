DROP POLICY IF EXISTS "Anyone can insert test_submissions" ON public.test_submissions;

CREATE POLICY "Allow anon insert test_submissions"
ON public.test_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);