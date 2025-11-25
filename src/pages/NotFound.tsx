// src/pages/NotFound.tsx
export default function NotFound() {
  return (
    <div className="min-h-screen flex  items-center justify-center px-4">
      <img
        src="/images/not_found.png"
        alt="페이지를 찾을 수 없습니다"
        className="mb-6 w-40 h-40 sm:w-52 sm:h-52 object-contain drop-shadow-lg"
      />
      <div className="text-center">
        <div className="text-3xl font-bold mb-2">404</div>
        <p className="text-slate-400">페이지를 찾을 수 없습니다.</p>
      </div>
    </div>
  );
}
