// src/pages/NotFound.tsx
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate("/landing");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="flex items-center text-center gap-6">
        <img
          src="/images/not_found.png"
          alt="페이지를 찾을 수 없습니다"
          className="w-40 h-40 sm:w-52 sm:h-52 object-contain drop-shadow-lg"
        />

        <div>
          <div className="text-3xl font-bold mb-2">404</div>
          <p className="text-slate-400 mb-4">페이지를 찾을 수 없습니다.</p>

          <Button
            onClick={handleGoBack}
            className={`
              cursor-pointer
              inline-flex items-center gap-2
              rounded-full border border-violet-500/40
              bg-violet-500/10
              px-10 py-5 text-large font-medium
              text-violet-100
              shadow-sm
              transition-all duration-200
              hover:-translate-y-0.5 hover:bg-violet-500/20
              hover:shadow-lg hover:shadow-violet-500/30
              active:translate-y-0
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60
            `}
          >
            <ArrowLeft className="w-12 h-12" />
            돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
}
