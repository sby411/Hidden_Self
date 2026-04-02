
CREATE OR REPLACE FUNCTION public.update_test_submission_payment(p_id uuid, p_payment_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.test_submissions
  SET payment_status = p_payment_status
  WHERE id = p_id;
END;
$$;
