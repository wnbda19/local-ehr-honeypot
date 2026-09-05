import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

const recentRequests = new Map<string, number[]>();

const sqlPatterns = [
  /('|%27)\s*(or|and)\s*('|%27)?\d/i,
  /union\s+select/i,
  /drop\s+table/i,
  /--|\/\*|\*\//,
  /sleep\s*\(/i,
  /xp_cmdshell/i
];

function getIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

function automatedUserAgent(userAgent: string | null) {
  if (!userAgent || userAgent.trim().length < 8) return true;
  return /(curl|wget|python-requests|postman|httpie|nikto|sqlmap|nmap|masscan|burp|zap|headless|phantomjs)/i.test(
    userAgent
  );
}

function malformedHeaders(request: NextRequest) {
  const accept = request.headers.get("accept");
  const contentType = request.headers.get("content-type");
  if (!request.headers.get("user-agent")) return true;
  if (contentType && contentType.length > 200) return true;
  return Boolean(accept && /[\r\n]/.test(accept));
}

function overRateLimit(ip: string) {
  const now = Date.now();
  const oneMinuteAgo = now - 60_000;
  const previous = recentRequests.get(ip)?.filter((time) => time > oneMinuteAgo) ?? [];
  previous.push(now);
  recentRequests.set(ip, previous);
  return previous.length > 5;
}

async function readBodyFields(request: NextRequest) {
  if (request.method !== "POST") return {};
  const clone = request.clone();
  const contentType = clone.headers.get("content-type") || "";

  try {
    if (contentType.includes("application/json")) {
      return (await clone.json()) as Record<string, unknown>;
    }
    if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const form = await clone.formData();
      return Object.fromEntries(form.entries());
    }
  } catch {
    return { malformed_body: "true" };
  }

  return {};
}

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  if (request.nextUrl.pathname !== "/api/login") return NextResponse.next();

  const ip = getIp(request);
  const fields = await readBodyFields(request);
  const values = Object.values(fields).map((value) => String(value));
  const attemptedEmail = String(fields.email || "");

  const attackTypes: string[] = [];
  if (values.some((value) => sqlPatterns.some((pattern) => pattern.test(value)))) {
    attackTypes.push("SQL injection pattern");
  }
  if (overRateLimit(ip)) attackTypes.push("Rate limit exceeded");
  if (automatedUserAgent(request.headers.get("user-agent"))) attackTypes.push("Automated or unusual user agent");
  if (malformedHeaders(request) || fields.malformed_body) attackTypes.push("Malformed headers or body");
  if (fields.company_website || fields.middle_name) attackTypes.push("Honeypot field submitted");

  if (attackTypes.length === 0) return NextResponse.next();

  const logUrl = new URL("/api/log-attempt", request.url);
  event.waitUntil(
    fetch(logUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "user-agent": request.headers.get("user-agent") || "",
        "x-forwarded-for": ip
      },
      body: JSON.stringify({
        attack_type: attackTypes.join(", "),
        attempted_email: attemptedEmail,
        source: "middleware"
      })
    }).catch(() => undefined)
  );

  return NextResponse.redirect(new URL("/fake-ehr", request.url), 303);
}

export const config = {
  matcher: ["/api/login"]
};
