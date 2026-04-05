-- 재회 페어(내 계정+상대 계정) AI 분석 + 스크랩 결과 72시간 캐시 (Edge service role 전용)
CREATE TABLE IF NOT EXISTS public.reunion_pair_analysis_cache (
  cache_key text PRIMARY KEY,
  payload jsonb NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reunion_pair_analysis_cache_expires_idx
  ON public.reunion_pair_analysis_cache (expires_at);

ALTER TABLE public.reunion_pair_analysis_cache ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.reunion_pair_analysis_cache IS 'reunion-instagram pair mode: 72h cache for scrape+Claude analyses';
