// src/routes/AppRoutes.tsx
import { Suspense, lazy } from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";

import AppLayout from "./AppLayout";
import LoginPage from "@/pages/Login";
import SignupPage from "@/pages/Signup";
import GithubCallbackPage from "@/pages/GithubCallbackPage";
import { useAuth } from "@/features/auth/AuthContext";

// Lazy Pages
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

/*───────────────────────────────
  🔐 로그인 필수 보호 레이아웃
───────────────────────────────*/
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

/*───────────────────────────────
  🟦 게스트 전용 페이지 (로그인 X)
───────────────────────────────*/
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
    return <Navigate to="/mypage/dashboard" replace />;
  }

  return <Outlet />;
}

/*───────────────────────────────
  📌 전체 라우터
───────────────────────────────*/
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
        {/* 🔵 게스트 전용 라우트 */}
        <Route element={<GuestOnlyRoute />}></Route>

        {/* 🧱 공통 레이아웃 */}
        <Route element={<AppLayout />}>
          {/* 공개 페이지 */}
          <Route path="/" element={<Landing />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/ui/reviews" element={<PostAuthRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          {/* 🔐 보호 라우트 */}
          <Route element={<RequireAuthLayout />}>
            <Route path="/mypage/dashboard" element={<Dashboard />} />
            <Route path="/mypage/analyses" element={<Analyses />} />
            <Route path="/mypage/analyses/:id" element={<AnalysisDetail />} />
            <Route path="/mypage/compare" element={<Compare />} />
            <Route path="/mypage/trends" element={<Trends />} />
            <Route path="/mypage/leaderboard" element={<Leaderboard />} />
            <Route path="/mypage/playground" element={<Playground />} />
            <Route path="/mypage/reports" element={<Reports />} />
            <Route path="/mypage/settings" element={<Settings />} />

            {/* OAuth 콜백 */}
            <Route
              path="/auth/github/callback"
              element={<GithubCallbackPage />}
            />
          </Route>
        </Route>

        {/* 레거시 처리 */}
        <Route
          path="/home"
          element={<Navigate to="/mypage/dashboard" replace />}
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
