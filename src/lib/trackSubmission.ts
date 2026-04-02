import { supabase } from "@/integrations/supabase/client";

/** Insert a 'processing' row when analysis starts via RPC. Returns the row id. */
export async function trackSubmissionStart(instagramId: string): Promise<string | null> {
  console.log("[trackSubmission] Starting insert for:", instagramId);
  console.log("[trackSubmission] Supabase URL:", import.meta.env.VITE_SUPABASE_URL ? "✅ connected" : "❌ missing");

  try {
    console.log("[trackSubmission] Calling RPC insert_test_submission...");

    const { data, error } = await supabase.rpc("insert_test_submission" as any, {
      p_instagram_id: instagramId,
      p_payment_status: "free",
      p_status: "processing",
    });

    if (error) {
      console.error("[trackSubmission] ❌ Insert FAILED:", JSON.stringify(error));
      return null;
    }

    const rowId = data as unknown as string;
    console.log("[trackSubmission] ✅ Insert SUCCESS, id:", rowId);
    return rowId;
  } catch (e) {
    console.error("[trackSubmission] ❌ Exception:", e);
    return null;
  }
}

/** Update row to 'success' with result_type via RPC. */
export function trackSubmissionSuccess(rowId: string, resultType: string) {
  console.log("[trackSubmission] Updating to success, rowId:", rowId, "resultType:", resultType);
  supabase
    .rpc("update_test_submission_status" as any, {
      p_id: rowId,
      p_status: "success",
      p_result_type: resultType,
    })
    .then(({ error }: any) => {
      if (error) {
        console.error("[trackSubmission] ❌ Update to success FAILED:", JSON.stringify(error));
      } else {
        console.log("[trackSubmission] ✅ Update to success OK");
      }
    });
}

/** Update row to 'failed' via RPC. */
export function trackSubmissionFailed(rowId: string) {
  console.log("[trackSubmission] Updating to failed, rowId:", rowId);
  supabase
    .rpc("update_test_submission_status" as any, {
      p_id: rowId,
      p_status: "failed",
    })
    .then(({ error }: any) => {
      if (error) {
        console.error("[trackSubmission] ❌ Update to failed FAILED:", JSON.stringify(error));
      } else {
        console.log("[trackSubmission] ✅ Update to failed OK");
      }
    });
}

/** Update row payment_status to 'paid' via RPC. */
export function trackPaymentSuccess(rowId: string) {
  console.log("[trackSubmission] Updating payment_status to paid, rowId:", rowId);
  supabase
    .rpc("update_test_submission_payment" as any, {
      p_id: rowId,
      p_payment_status: "paid",
    })
    .then(({ error }: any) => {
      if (error) {
        console.error("[trackSubmission] ❌ Payment status update FAILED:", JSON.stringify(error));
      } else {
        console.log("[trackSubmission] ✅ Payment status update to paid OK");
      }
    });
}
