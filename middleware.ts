import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Initialize next-intl localization middleware
const intlMiddleware = createMiddleware(routing);

// Simple memory-based rate limiter cache
const rateLimitCache = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests per minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const clientData = rateLimitCache.get(ip);

  if (!clientData) {
    rateLimitCache.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (now > clientData.resetTime) {
    clientData.count = 1;
    clientData.resetTime = now + RATE_LIMIT_WINDOW_MS;
    return false;
  }

  clientData.count++;
  return clientData.count > MAX_REQUESTS_PER_WINDOW;
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Process API Routes Security
  if (pathname.startsWith("/api")) {
    const origin = req.headers.get("origin") || req.headers.get("referer") || "";
    const isDevelopment = process.env.NODE_ENV === "development";
    const host = req.headers.get("host") || "";

    // A. CORS Protection: Allow same-origin requests or local development
    const isSameOrigin = 
      origin.includes(host) || 
      (isDevelopment && (origin.includes("localhost") || origin.includes("127.0.0.1")));

    if (origin && !isSameOrigin) {
      return new NextResponse(
        JSON.stringify({ error: "Access Forbidden: External CORS request denied." }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // B. Anti-Bot / Script Check: Block common scripting tools and automated libraries
    const userAgent = req.headers.get("user-agent") || "";
    const isBot = /curl|postman|python|wget|go-http-client|axios|insomnia/i.test(userAgent);
    if (isBot) {
      return new NextResponse(
        JSON.stringify({ error: "Access Denied: Scripts and automated clients are not permitted." }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // C. Sec-Fetch-Site Verification: Ensure request originated within our website
    const secFetchSite = req.headers.get("sec-fetch-site");
    if (secFetchSite && !["same-origin", "same-site", "none"].includes(secFetchSite)) {
      return new NextResponse(
        JSON.stringify({ error: "Access Denied: Sec-Fetch-Site origin mismatch." }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // D. Rate Limiting Check
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "anonymous";
    if (isRateLimited(ip)) {
      return new NextResponse(
        JSON.stringify({ error: "Too Many Requests: Rate limit exceeded. Please try again in a minute." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    // Pass-through the request to API handler
    const response = NextResponse.next();

    // Inject security response headers specifically for API routes
    response.headers.set("Access-Control-Allow-Origin", origin || "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, X-Requested-With");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");

    return response;
  }

  // 2. Process non-API route pages using next-intl
  const response = intlMiddleware(req);

  // Apply general security headers to pages
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' ws: wss:;"
  );

  return response;
}

// Config matcher including api routes and pages
export const config = {
  matcher: [
    "/",
    "/(ar|en)/:path*",
    "/api/:path*", // Secure the API endpoints
    "/((?!_next|_vercel|.*\\..*).*)", // Pages and app assets (excluding static files)
  ],
};
