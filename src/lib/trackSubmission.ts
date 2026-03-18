import { supabase } from "@/integrations/supabase/client";

/** Insert a minimal 'processing' row when analysis starts. Returns the row id. */
export async function trackSubmissionStart(instagramId: string): Promise<string | null> {
  console.log("[trackSubmission] Starting insert for:", instagramId);
  console.log("[trackSubmission] Supabase URL:", import.meta.env.VITE_SUPABASE_URL ? "✅ connected" : "❌ missing");

  try {
    const payload = {
      instagram_id: instagramId,
      payment_status: "free",
      status: "processing",
    };
    console.log("[trackSubmission] Insert payload:", JSON.stringify(payload));

    const { data, error } = await supabase
      .from("test_submissions")
      .insert(payload as any)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("[trackSubmission] ❌ Insert FAILED:", JSON.stringify(error));
      return null;
    }

    console.log("[trackSubmission] ✅ Insert SUCCESS, id:", data?.id);
    return data?.id ?? null;
  } catch (e) {
    console.error("[trackSubmission] ❌ Exception:", e);
    return null;
  }
}

/** Update row to 'success' with result_type. */
export function trackSubmissionSuccess(rowId: string, resultType: string) {
  console.log("[trackSubmission] Updating to success, rowId:", rowId, "resultType:", resultType);
  supabase
    .from("test_submissions")
    .update({ status: "success", result_type: resultType } as any)
    .eq("id", rowId)
    .then(({ error }) => {
      if (error) {
        console.error("[trackSubmission] ❌ Update to success FAILED:", JSON.stringify(error));
      } else {
        console.log("[trackSubmission] ✅ Update to success OK");
      }
    });
}

/** Update row to 'failed'. */
export function trackSubmissionFailed(rowId: string) {
  console.log("[trackSubmission] Updating to failed, rowId:", rowId);
  supabase
    .from("test_submissions")
    .update({ status: "failed" } as any)
    .eq("id", rowId)
    .then(({ error }) => {
      if (error) {
        console.error("[trackSubmission] ❌ Update to failed FAILED:", JSON.stringify(error));
      } else {
        console.log("[trackSubmission] ✅ Update to failed OK");
      }
    });
}
