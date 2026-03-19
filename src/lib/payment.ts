// Iamport (PortOne) payment integration

declare global {
  interface Window {
    IMP: {
      init: (merchantId: string) => void;
      request_pay: (
        params: {
          pg: string;
          pay_method: string;
          merchant_uid: string;
          name: string;
          amount: number;
          buyer_email?: string;
          buyer_name?: string;
        },
        callback: (rsp: {
          success: boolean;
          imp_uid?: string;
          merchant_uid?: string;
          error_code?: string;
          error_msg?: string;
        }) => void
      ) => void;
    };
  }
}

interface PaymentResult {
  success: boolean;
  imp_uid?: string;
  merchant_uid?: string;
  error_code?: string;
  error_msg?: string;
}

const PG_CANDIDATES = ["kcp", "kcp.T0000"] as const;

export async function requestPayment(instagramId: string): Promise<PaymentResult> {
  const { IMP } = window;

  if (!IMP) {
    return { success: false, error_msg: "결제 모듈을 불러올 수 없습니다." };
  }

  IMP.init("imp68430821");

  const requestWithPg = (pg: string) =>
    new Promise<PaymentResult>((resolve) => {
      IMP.request_pay(
        {
          pg,
          pay_method: "card",
          merchant_uid: `order_${instagramId}_${Date.now()}`,
          name: "인스타 연애 패턴 분석",
          amount: 4900,
        },
        (rsp) => {
          console.log("[PortOne] Payment response:", { pg, ...rsp });
          if (!rsp.success) {
            console.error("[PortOne] Payment failed:", rsp.error_msg);
          }
          resolve(rsp);
        }
      );
    });

  let lastResult: PaymentResult = {
    success: false,
    error_msg: "결제 요청에 실패했습니다.",
  };

  for (let i = 0; i < PG_CANDIDATES.length; i += 1) {
    const pg = PG_CANDIDATES[i];
    const result = await requestWithPg(pg);
    lastResult = result;

    if (result.success) {
      return result;
    }

    const isInvalidPgError =
      result.error_code === "NOT_READY" &&
      (result.error_msg?.includes("pg 파라미터") ?? false);

    if (!isInvalidPgError || i === PG_CANDIDATES.length - 1) {
      if (isInvalidPgError) {
        return {
          ...result,
          error_msg:
            "결제 채널 설정이 아직 연결되지 않았습니다. PortOne 관리자에서 KCP 채널 활성화 후 KCP 사이트코드(MID) 또는 V2 Store ID를 알려주세요.",
        };
      }
      return result;
    }
  }

  return lastResult;
}
