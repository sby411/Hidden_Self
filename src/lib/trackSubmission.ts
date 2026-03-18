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

export async function trackSubmission(instagramId: string, resultType?: string) {
  const { device_type, browser, os } = detectDevice();
  
  await supabase.from("test_submissions").insert({
    instagram_id: instagramId,
    result_type: resultType || null,
    device_type,
    browser,
    os,
    user_agent: navigator.userAgent,
    session_id: getSessionId(),
  });
}
