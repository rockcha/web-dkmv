// api/reviews.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import http from "http";
import https from "https";
import { URL } from "url";

const TARGET = process.env.TARGET_API || "http://18.205.229.159:8000";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // 프론트에서 보내온 body (이미 JSON 파싱된 상태일 가능성 높음)
    const payload = req.body ?? {};

    const bodyStr = JSON.stringify(payload);

    // 타겟 URL: /v1/reviews
    const base = TARGET.replace(/\/+$/, "");
    const urlObj = new URL(base + "/v1/reviews");

    const isHttps = urlObj.protocol === "https:";
    const client = isHttps ? https : http;

    const headers: Record<string, string> = {
      // 백엔드에 넘길 헤더
      "content-type": "application/json",
      "content-length": Buffer.byteLength(bodyStr).toString(),
    };

    // Authorization 같은 헤더를 그대로 넘기고 싶다면 여기서 추가
    if (typeof req.headers.authorization === "string") {
      headers["authorization"] = req.headers.authorization;
    }

    const options: http.RequestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: "GET", // 🔥 여기서 진짜로 GET + body로 보냄
      headers,
    };

    const proxyReq = client.request(options, (proxyRes) => {
      // 백엔드에서 온 상태코드/헤더를 그대로 클라이언트에게 전달
      res.status(proxyRes.statusCode || 500);
      Object.entries(proxyRes.headers).forEach(([key, val]) => {
        if (typeof val === "string") {
          res.setHeader(key, val);
        }
      });

      proxyRes.pipe(res);
    });

    proxyReq.on("error", (err) => {
      console.error("[api/reviews] proxy error:", err);
      if (!res.headersSent) {
        res
          .status(500)
          .json({ message: "Proxy error", error: String(err?.message || err) });
      } else {
        res.end();
      }
    });

    // 🔥 GET 이지만 body를 직접 써서 보낸다
    proxyReq.write(bodyStr);
    proxyReq.end();
  } catch (err: any) {
    console.error("[api/reviews] handler error:", err);
    res
      .status(500)
      .json({ message: "Proxy error", error: String(err?.message || err) });
  }
}
