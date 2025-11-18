// api/reviews.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

const TARGET = process.env.TARGET_API || "http://18.205.229.159:8000";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // 프론트에서 /api/reviews?page=1 로 들어온 쿼리를 그대로 백엔드로 넘긴다
    const qs = req.url?.includes("?")
      ? req.url.slice(req.url.indexOf("?"))
      : "";

    const targetUrl = TARGET.replace(/\/+$/, "") + "/v1/reviews" + qs;

    const headers: Record<string, string> = {};
    for (const [k, v] of Object.entries(req.headers)) {
      if (typeof v === "string") headers[k] = v;
    }
    delete headers.host;
    delete headers["content-length"];

    // 🔥 백엔드에는 항상 GET, 그리고 body 없음
    const resp = await fetch(targetUrl, {
      method: "GET",
      headers,
      // body: 없음
    });

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
