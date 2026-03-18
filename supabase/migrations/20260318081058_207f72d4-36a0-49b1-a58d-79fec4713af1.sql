CREATE OR REPLACE FUNCTION public.insert_test_submission(
  p_instagram_id text,
  p_payment_status text DEFAULT 'free',
  p_status text DEFAULT 'processing',
  p_device_type text DEFAULT NULL,
  p_browser text DEFAULT NULL,
  p_os text DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_session_id text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
BEGIN
  INSERT INTO public.test_submissions (
    instagram_id, payment_status, status,
    device_type, browser, os, user_agent, session_id
  ) VALUES (
    p_instagram_id, p_payment_status, p_status,
    p_device_type, p_browser, p_os, p_user_agent, p_session_id
  )
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_test_submission_status(
  p_id uuid,
  p_status text,
  p_result_type text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.test_submissions
  SET status = p_status,
      result_type = COALESCE(p_result_type, result_type)
  WHERE id = p_id;
END;
$$;