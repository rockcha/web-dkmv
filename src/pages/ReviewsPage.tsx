// // src/pages/ReviewsPage.tsx
// import * as React from "react";

// import { setAuthToken, getAuthToken, clearAuthToken } from "@/lib/auth";

// // shadcn/ui
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Separator } from "@/components/ui/separator";

// type ReviewItem = {
//   review_id?: number;
//   global_score?: number;
//   model_score?: number;
//   categories?: { name: string; score: number; comment?: string }[];
//   summary?: string;
//   created_at?: string;
// };

// export default function ReviewsPage() {
//   // ---- state
//   const [limit, setLimit] = React.useState<number>(20);
//   const [loading, setLoading] = React.useState(false);
//   const [posting, setPosting] = React.useState(false);
//   const [error, setError] = React.useState<string>("");
//   const [items, setItems] = React.useState<ReviewItem[]>([]);
//   const [tokenInput, setTokenInput] = React.useState(getAuthToken() ?? "");

//   // 초기 예시 payload (Raw JSON)
//   const [payload, setPayload] = React.useState<string>(
//     JSON.stringify(
//       {
//         global_score: 85,
//         model_score: 87,
//         categories: [
//           { name: "readability", score: 4, comment: "코드 가독성 양호" },
//           { name: "maintainability", score: 4, comment: "구조가 단순" },
//         ],
//         summary: "샘플 리뷰 요약",
//       },
//       null,
//       2
//     )
//   );

//   // ---- actions
//   const load = React.useCallback(async () => {
//     try {
//       setLoading(true);
//       setError("");
//       const data = await fetchReviews(limit);
//       setItems(Array.isArray(data) ? data : []);
//     } catch (e: any) {
//       setError(String(e?.message || e));
//     } finally {
//       setLoading(false);
//     }
//   }, [limit]);

//   React.useEffect(() => {
//     // 첫 진입 시 목록 로드
//     void load();
//   }, [load]);

//   const saveToken = () => {
//     setAuthToken(tokenInput || "");
//     alert("토큰 저장됨");
//   };
//   const removeToken = () => {
//     clearAuthToken();
//     setTokenInput("");
//     alert("토큰 제거됨");
//   };

//   async function onCreate(e: React.FormEvent) {
//     e.preventDefault();
//     let body: unknown;
//     try {
//       body = JSON.parse(payload);
//     } catch {
//       setError("JSON 파싱 실패: 유효한 JSON인지 확인하세요.");
//       return;
//     }

//     try {
//       setPosting(true);
//       setError("");
//       await createReviewRaw(body);
//       await load(); // 저장 후 목록 다시 불러오기
//     } catch (e: any) {
//       setError(String(e?.message || e));
//     } finally {
//       setPosting(false);
//     }
//   }

//   // ---- UI
//   return (
//     <div className="mx-auto max-w-6xl p-6 space-y-6">
//       {/* 헤더 */}
//       <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
//         <h1 className="text-2xl font-semibold tracking-tight">
//           Reviews (임시)
//         </h1>

//         <div className="flex flex-col gap-2 md:flex-row md:items-center">
//           {/* 토큰 입력 */}
//           <div className="flex items-center gap-2">
//             <Input
//               value={tokenInput}
//               onChange={(e) => setTokenInput(e.target.value)}
//               placeholder="Bearer 토큰"
//               className="w-[340px]"
//             />
//             <Button variant="secondary" onClick={saveToken}>
//               저장
//             </Button>
//             <Button variant="outline" onClick={removeToken}>
//               삭제
//             </Button>
//           </div>

//           {/* limit + 새로고침 */}
//           <div className="flex items-center gap-2 md:ml-4">
//             <Label htmlFor="limit" className="text-sm text-muted-foreground">
//               limit
//             </Label>
//             <Input
//               id="limit"
//               className="w-24"
//               type="number"
//               min={1}
//               value={limit}
//               onChange={(e) => setLimit(Number(e.target.value || 20))}
//             />
//             <Button variant="outline" onClick={load} disabled={loading}>
//               {loading ? "불러오는 중…" : "새로고침"}
//             </Button>
//           </div>
//         </div>
//       </header>

//       {/* 생성 폼 (Raw JSON) */}
//       <Card className="border border-slate-200 dark:border-slate-800">
//         <CardHeader>
//           <CardTitle className="text-lg">리뷰 생성 (Raw JSON)</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={onCreate} className="space-y-3">
//             <Label className="text-sm text-muted-foreground">
//               Payload (JSON)
//             </Label>
//             <Textarea
//               className="min-h-[200px] font-mono text-sm"
//               value={payload}
//               onChange={(e) => setPayload(e.target.value)}
//             />
//             <div className="flex items-center gap-3 pt-1">
//               <Button type="submit" disabled={posting}>
//                 {posting ? "저장 중…" : "리뷰 저장"}
//               </Button>
//               {error && <span className="text-sm text-red-600">{error}</span>}
//             </div>
//             <p className="text-xs text-muted-foreground">
//               * 백엔드 스키마를 그대로 보냅니다. 필요한 필드를 JSON으로 자유롭게
//               편집하세요.
//             </p>
//           </form>
//         </CardContent>
//       </Card>

//       {/* 목록 */}
//       <section>
//         <div className="mb-2 flex items-center justify-between">
//           <h2 className="text-xl font-medium">리뷰 목록</h2>
//           <span className="text-sm text-muted-foreground">
//             {items.length}개
//           </span>
//         </div>

//         {loading && (
//           <Card>
//             <CardContent className="py-8 text-center text-sm text-muted-foreground">
//               불러오는 중…
//             </CardContent>
//           </Card>
//         )}

//         {!loading && items.length === 0 && (
//           <Card>
//             <CardContent className="py-8 text-center text-sm text-muted-foreground">
//               데이터가 없습니다.
//             </CardContent>
//           </Card>
//         )}

//         <div className="space-y-4">
//           {items.map((r) => (
//             <Card
//               key={String(r.review_id ?? Math.random())}
//               className="border border-slate-200/70 dark:border-slate-800/70"
//             >
//               <CardHeader className="pb-2">
//                 <CardTitle className="flex flex-wrap items-center gap-2 text-base">
//                   <span className="font-semibold">#{r.review_id}</span>
//                   <Separator orientation="vertical" className="h-4" />
//                   <span>
//                     Global: <b>{r.global_score ?? "-"}</b>
//                   </span>
//                   <Separator orientation="vertical" className="h-4" />
//                   <span>
//                     Model: <b>{r.model_score ?? "-"}</b>
//                   </span>
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3 text-sm">
//                 {r.summary && (
//                   <p className="whitespace-pre-wrap leading-relaxed">
//                     {r.summary}
//                   </p>
//                 )}

//                 {Array.isArray(r.categories) && r.categories.length > 0 && (
//                   <div className="rounded-lg border p-3">
//                     <div className="mb-2 font-medium">Categories</div>
//                     <ul className="space-y-1">
//                       {r.categories.map((c, i) => (
//                         <li
//                           key={i}
//                           className="flex flex-wrap items-center gap-2"
//                         >
//                           <span className="rounded bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-800">
//                             {c.name}
//                           </span>
//                           <span className="text-xs text-muted-foreground">
//                             score: {c.score}
//                           </span>
//                           {c.comment && (
//                             <span className="text-xs">— {c.comment}</span>
//                           )}
//                         </li>
//                       ))}
//                     </ul>
//                   </div>
//                 )}

//                 {r.created_at && (
//                   <div className="text-xs text-muted-foreground">
//                     {new Date(r.created_at).toLocaleString()}
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </section>
//     </div>
//   );
// }
