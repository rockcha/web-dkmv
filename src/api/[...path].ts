// /api/[...path].ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

const TARGET = process.env.TARGET_API || "http://18.205.229.159:8002";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const segments = (req.query.path ?? []) as string[];
    const pathname = "/" + segments.join("/");
    const qs = req.url?.includes("?")
      ? req.url.slice(req.url.indexOf("?"))
      : "";
    const targetUrl = TARGET.replace(/\/+$/, "") + pathname + (qs || "");

    // 원본 헤더 중 브라우저/프록시에 민감한 것 제거
    const headers: Record<string, string> = {};
    for (const [k, v] of Object.entries(req.headers)) {
      if (typeof v === "string") headers[k] = v;
    }
    delete headers.host;
    delete headers["content-length"];

    const method = (req.method || "GET").toUpperCase();

    // 바디 준비(이미지/폼 등도 통과시키지만, 우선 JSON 사용 가정)
    // vercel-node는 req.body가 이미 파싱되어 들어오는 경우가 있음
    let body: BodyInit | undefined = undefined;
    if (!["GET", "HEAD"].includes(method)) {
      if (typeof req.body === "string" || Buffer.isBuffer(req.body)) {
        body = req.body as any;
      } else if (req.body) {
        headers["content-type"] = headers["content-type"] || "application/json";
        body = JSON.stringify(req.body);
      }
    }

    const resp = await fetch(targetUrl, { method, headers, body });
    res.setHeader("x-proxy-target", targetUrl);
    // 백엔드 응답 헤더 복사(전송에 문제될 수 있는 건 제외)
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
