// src/routes/AppRoutes.tsx
import { Suspense, lazy } from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import AppLayout from "./AppLayout";
import LoginPage from "@/pages/Login";
import { useAuth } from "@/features/auth/useAuth";

/** 페이지 Lazy 로드 */
const Landing = lazy(() => import("@/pages/Landing"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Analyses = lazy(() => import("@/pages/Analyses"));
const AnalysisDetail = lazy(() => import("@/pages/AnalysisDetail"));
const Compare = lazy(() => import("@/pages/Compare"));
const Trends = lazy(() => import("@/pages/Trends"));
const Leaderboard = lazy(() => import("@/pages/Leaderboard"));
const Playground = lazy(() => import("@/pages/Playground"));
const Reports = lazy(() => import("@/pages/Reports"));
const Settings = lazy(() => import("@/pages/Settings"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const PostAuthRedirect = lazy(() => import("@/pages/PostAuthRedirect"));

/**
 * 로그인 필수 레이아웃
 * - 로딩 중이면 간단한 스피너/텍스트
 * - 비로그인 상태면 /login 으로 리다이렉트
 */
function RequireAuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">
        인증 상태 확인 중…
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  return <Outlet />;
}

/**
 * 게스트(비로그인 사용자)만 접근 가능한 라우트
 * - 로그인되어 있으면 /dashboard 로 리다이렉트
 */
function GuestOnlyRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">
        인증 상태 확인 중…
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default function AppRoutes() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">
          Loading…
        </div>
      }
    >
      <Routes>
        {/* 🔐 비로그인 사용자만 접근 가능한 라우트: /login */}
        <Route element={<GuestOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* 🧱 공통 레이아웃 (헤더/사이드바) */}
        <Route element={<AppLayout />}>
          {/* 누구나 볼 수 있는 랜딩 페이지 */}
          <Route path="/" element={<Landing />} />

          {/* 이 아래는 로그인 필수 */}
          <Route path="/landing" element={<Landing />} />
          <Route path="/ui/reviews" element={<PostAuthRedirect />} />
          <Route element={<RequireAuthLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analyses" element={<Analyses />} />
            <Route path="/analyses/:id" element={<AnalysisDetail />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/trends" element={<Trends />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/playground" element={<Playground />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            {/* 백엔드에서 콜백 후 보내는 경로 → 바로 landing 으로 리다이렉트 */}
          </Route>
        </Route>

        {/* 레거시/잘못된 경로 처리 */}
        <Route path="/home" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
