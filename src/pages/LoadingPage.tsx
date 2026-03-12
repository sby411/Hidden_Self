import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const loadingMessages = [
  "사진 스타일 분석 중...",
  "색감 패턴 분석 중...",
  "캡션 감성 분석 중...",
  "당신의 인스타 vibe 정리 중...",
  "당신에게 끌리는 남자 유형 계산 중...",
];

const LoadingPage = () => {
  const [currentMsg, setCurrentMsg] = useState(0);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id") || "";

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMsg((prev) => {
        if (prev < loadingMessages.length - 1) return prev + 1;
        return prev;
      });
    }, 550);

    const timer = setTimeout(() => {
      navigate(`/result?id=${encodeURIComponent(id)}`, { replace: true });
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [navigate, id]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5">
      <div className="relative w-16 h-16 mb-8">
        <div className="absolute inset-0 rounded-full border-2 border-border" />
        <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>

      <div className="space-y-2 text-center">
        {loadingMessages.map((msg, i) => (
          <p
            key={msg}
            className={`text-sm transition-all duration-500 ${
              i <= currentMsg
                ? "text-foreground opacity-100 translate-y-0"
                : "text-muted-foreground opacity-0 translate-y-2"
            } ${i === currentMsg ? "font-semibold" : "font-normal"}`}
          >
            {msg}
          </p>
        ))}
      </div>

      <p className="text-[11px] text-muted-foreground mt-12">
        @{id}님의 인스타를 분석하고 있어요
      </p>
    </div>
  );
};

export default LoadingPage;
