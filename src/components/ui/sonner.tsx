// src/components/ui/sonner.tsx

import { Toaster as Sonner } from "sonner";
import type { ToasterProps } from "sonner";

const Toaster = (props: ToasterProps) => {
  return (
    <Sonner
      theme="light" // ✅ 항상 라이트 테마
      position="bottom-right" // ✅ 우하단
      richColors
      toastOptions={{
        classNames: {
          // ✅ 항상 흰 배경 + 검정 텍스트
          toast:
            "bg-white text-slate-900 border border-slate-200 shadow-lg rounded-lg",
          description: "text-slate-600",
          actionButton: "bg-violet-500 hover:bg-violet-600 text-white",
          closeButton: "text-slate-400 hover:text-slate-600",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
