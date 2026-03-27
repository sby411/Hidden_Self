
CREATE TABLE public.analysis_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instagram_id text NOT NULL,
  result jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT unique_instagram_id UNIQUE (instagram_id)
);

ALTER TABLE public.analysis_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon and authenticated to select cache"
  ON public.analysis_cache FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow service role to insert cache"
  ON public.analysis_cache FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
