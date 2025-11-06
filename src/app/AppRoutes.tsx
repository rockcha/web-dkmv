// src/routes/AppRoutes.tsx
import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./AppLayout";
import ExtensionDemo from "@/pages/ExtensionDemo";

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

export default function AppRoutes() {
  return (
    <Suspense fallback={<div className="p-8 text-sm">Loading…</div>}>
      <Routes>
        {/* 랜딩은 풀스크린 단독 */}
        <Route path="/extension-demo" element={<ExtensionDemo />} />
        {/* 공통 레이아웃(헤더/사이드바) */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analyses" element={<Analyses />} />
          <Route path="/analyses/:id" element={<AnalysisDetail />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/trends" element={<Trends />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/playground" element={<Playground />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* 레거시/잘못된 경로 처리 */}
        <Route path="/home" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
