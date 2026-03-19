// PortOne V2 payment integration

declare global {
  interface Window {
    PortOne: {
      requestPayment: (params: {
        storeId: string;
        channelKey: string;
        paymentId: string;
        orderName: string;
        totalAmount: number;
        currency: string;
        payMethod: string;
        customer?: {
          fullName?: string;
          email?: string;
          phoneNumber?: string;
        };
      }) => Promise<{
        code?: string;
        message?: string;
        transactionType?: string;
        txId?: string;
        paymentId?: string;
      }>;
    };
  }
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  txId?: string;
  error_msg?: string;
}

const STORE_ID = "store-19320ea7-2a16-4da0-8c3e-56883c5cc551";
const CHANNEL_KEY = "channel-key-047781f8-40e9-4c20-8f28-e29645ca221c";

export async function requestPayment(instagramId: string): Promise<PaymentResult> {
  const { PortOne } = window;

  if (!PortOne) {
    return { success: false, error_msg: "결제 모듈을 불러올 수 없습니다." };
  }

  const paymentId = `payment_${instagramId}_${Date.now()}`;

  try {
    const response = await PortOne.requestPayment({
      storeId: STORE_ID,
      channelKey: CHANNEL_KEY,
      paymentId,
      orderName: "인스타 연애 패턴 분석",
      totalAmount: 4900,
      currency: "CURRENCY_KRW",
      payMethod: "CARD",
    });

    console.log("[PortOne V2] Payment response:", response);

    if (response.code) {
      // Error or user cancellation
      console.error("[PortOne V2] Payment failed:", response.message);
      return {
        success: false,
        paymentId,
        error_msg: response.message || "결제가 취소되었습니다.",
      };
    }

    // Success
    return {
      success: true,
      paymentId,
      txId: response.txId,
    };
  } catch (err: any) {
    console.error("[PortOne V2] Payment error:", err);
    return {
      success: false,
      paymentId,
      error_msg: err?.message || "결제 중 오류가 발생했습니다.",
    };
  }
}
