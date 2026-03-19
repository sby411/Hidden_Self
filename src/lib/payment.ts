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
  error_msg?: string;
}

export function requestPayment(instagramId: string): Promise<PaymentResult> {
  return new Promise((resolve) => {
    const { IMP } = window;

    if (!IMP) {
      resolve({ success: false, error_msg: "결제 모듈을 불러올 수 없습니다." });
      return;
    }

    IMP.init("imp68430821");

    IMP.request_pay(
      {
        pg: "kcp",
        pay_method: "card",
        merchant_uid: `order_${instagramId}_${Date.now()}`,
        name: "인스타 연애 패턴 심층 분석 리포트",
        amount: 4900,
      },
      (rsp) => {
        resolve(rsp);
      }
    );
  });
}
