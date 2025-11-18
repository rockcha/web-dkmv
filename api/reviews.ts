// api/reviews.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

const TARGET = process.env.TARGET_API || "http://18.205.229.159:8000";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // 우리가 최종적으로 때리고 싶은 백엔드 엔드포인트
    const targetUrl = TARGET.replace(/\/+$/, "") + "/v1/reviews";

    // --- 헤더 정리 ---
    const headers: Record<string, string> = {};
    for (const [k, v] of Object.entries(req.headers)) {
      if (typeof v === "string") headers[k] = v;
    }
    delete headers.host;
    delete headers["content-length"];

    // 브라우저에서는 POST로 오지만, 백엔드 스펙은 GET이므로 변환
    const originalMethod = (req.method || "GET").toUpperCase();
    const targetMethod = originalMethod === "POST" ? "GET" : originalMethod;

    // --- body 준비 ---
    let body: BodyInit | undefined = undefined;
    if (targetMethod !== "HEAD") {
      if (typeof req.body === "string" || Buffer.isBuffer(req.body)) {
        body = req.body as any;
      } else if (req.body && Object.keys(req.body).length > 0) {
        headers["content-type"] = headers["content-type"] || "application/json";
        body = JSON.stringify(req.body);
      }
    }

    const resp = await fetch(targetUrl, {
      method: targetMethod,
      headers,
      body,
    });

    // 디버깅용 헤더
    res.setHeader("x-proxy-target", targetUrl);

    resp.headers.forEach((val, key) => {
      if (!["transfer-encoding"].includes(key.toLowerCase())) {
        res.setHeader(key, val);
      }
    });

    const arrayBuf = await resp.arrayBuffer();
    res.status(resp.status).send(Buffer.from(arrayBuf));
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Proxy error", error: String(err?.message || err) });
  }
}
