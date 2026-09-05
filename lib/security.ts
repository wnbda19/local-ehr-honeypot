import crypto from "crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { UAParser } from "ua-parser-js";
import { query } from "@/lib/db";

export type SessionUser = {
  id: string;
  email: string;
  role: string;
  is_authorized: boolean;
};

export type SecurityLogInput = {
  ip: string;
  country?: string | null;
  city?: string | null;
  device?: string | null;
  browser?: string | null;
  os?: string | null;
  attack_type: string;
  attempt_count?: number;
  attempted_email?: string | null;
};

const SESSION_COOKIE = "ehr_session";

export function getClientIp(headerList = headers()) {
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return headerList.get("x-real-ip") || "unknown";
}

export function parseUserAgent(userAgent: string | null) {
  const parsed = new UAParser(userAgent || "").getResult();
  const device =
    parsed.device.vendor || parsed.device.model
      ? [parsed.device.vendor, parsed.device.model].filter(Boolean).join(" ")
      : parsed.device.type || "Desktop";

  return {
    device,
    browser: [parsed.browser.name, parsed.browser.version].filter(Boolean).join(" ") || "Unknown",
    os: [parsed.os.name, parsed.os.version].filter(Boolean).join(" ") || "Unknown"
  };
}

export function detectSqlInjection(value: string) {
  const patterns = [
    /('|%27)\s*(or|and)\s*('|%27)?\d/i,
    /union\s+select/i,
    /select\s+.+\s+from/i,
    /insert\s+into/i,
    /drop\s+table/i,
    /--|\/\*|\*\//,
    /sleep\s*\(|benchmark\s*\(/i,
    /xp_cmdshell/i
  ];
  return patterns.some((pattern) => pattern.test(value));
}

export function detectAutomatedUserAgent(userAgent: string | null) {
  if (!userAgent || userAgent.trim().length < 8) return true;
  return /(curl|wget|python-requests|postman|httpie|nikto|sqlmap|nmap|masscan|burp|zap|headless|phantomjs)/i.test(
    userAgent
  );
}

export function detectMalformedHeaders(headerList = headers()) {
  const accept = headerList.get("accept");
  const userAgent = headerList.get("user-agent");
  const contentType = headerList.get("content-type");

  if (!userAgent) return true;
  if (contentType && contentType.length > 200) return true;
  if (accept && /[\r\n]/.test(accept)) return true;
  return false;
}

export function signSession(email: string) {
  const secret = process.env.EHR_SESSION_SECRET || "local-dev-secret";
  const payload = Buffer.from(JSON.stringify({ email, ts: Date.now() })).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifySession(token?: string) {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;

  const secret = process.env.EHR_SESSION_SECRET || "local-dev-secret";
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;

  const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
    email: string;
    ts: number;
  };

  const maxAge = 1000 * 60 * 60 * 8;
  if (Date.now() - decoded.ts > maxAge) return null;
  return decoded;
}

export async function getCurrentUser() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = verifySession(token);
  let email = session?.email;

  if (!email && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_")) {
    try {
      const { currentUser } = await import("@clerk/nextjs/server");
      const clerkUser = await currentUser();
      email = clerkUser?.emailAddresses[0]?.emailAddress?.toLowerCase();
    } catch {
      email = undefined;
    }
  }

  if (!email) return null;

  const result = await query<SessionUser>(
    "SELECT id, email, role, is_authorized FROM users WHERE email = $1 LIMIT 1",
    [email]
  );
  return result.rows[0] ?? null;
}

export async function requireAuthorizedUser() {
  const user = await getCurrentUser();
  if (!user || !user.is_authorized) redirect("/login");
  return user;
}

export async function requireAdminUser() {
  const user = await requireAuthorizedUser();
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}

export async function logSecurityEvent(input: SecurityLogInput) {
  await query(
    `INSERT INTO security_logs
      (ip, country, city, device, browser, os, attack_type, attempt_count, attempted_email)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      input.ip,
      input.country ?? null,
      input.city ?? null,
      input.device ?? null,
      input.browser ?? null,
      input.os ?? null,
      input.attack_type,
      input.attempt_count ?? 1,
      input.attempted_email ?? null
    ]
  );
}

export const sessionCookieName = SESSION_COOKIE;
