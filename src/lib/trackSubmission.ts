import { supabase } from "@/integrations/supabase/client";

function detectDevice(): { device_type: string; browser: string; os: string } {
  const ua = navigator.userAgent;
  
  let device_type = "desktop";
  if (/Mobi|Android/i.test(ua)) device_type = "mobile";
  else if (/Tablet|iPad/i.test(ua)) device_type = "tablet";

  let browser = "unknown";
  if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edg")) browser = "Edge";

  let os = "unknown";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (/iPhone|iPad/.test(ua)) os = "iOS";

  return { device_type, browser, os };
}

function getSessionId(): string {
  let sid = sessionStorage.getItem("instai_session");
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem("instai_session", sid);
  }
  return sid;
}

/** Insert a 'processing' row when analysis starts. Returns the row id. */
export async function trackSubmissionStart(instagramId: string): Promise<string | null> {
  try {
    const { device_type, browser, os } = detectDevice();
    const { data } = await supabase.from("test_submissions").insert({
      instagram_id: instagramId,
      device_type,
      browser,
      os,
      user_agent: navigator.userAgent,
      session_id: getSessionId(),
      payment_status: "free",
      status: "processing",
    }).select("id").single();
    return data?.id ?? null;
  } catch {
    return null;
  }
}

/** Update row to 'success' with result_type. Fire-and-forget. */
export function trackSubmissionSuccess(rowId: string, resultType: string) {
  supabase.from("test_submissions")
    .update({ status: "success", result_type: resultType } as any)
    .eq("id", rowId)
    .then(() => {});
}

/** Update row to 'failed'. Fire-and-forget. */
export function trackSubmissionFailed(rowId: string) {
  supabase.from("test_submissions")
    .update({ status: "failed" } as any)
    .eq("id", rowId)
    .then(() => {});
}
