import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { CURRENT_WEBSITE_ID } from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const ADMIN_API_BASE_URL = (
  process.env.ADMIN_API_BASE_URL ||
  process.env.ADMIN_API_URL ||
  "https://admin.rajbiosis.app"
).replace(/\/$/, "");

export async function POST(request) {
  try {
    const input = await request.json();
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
    }

    const data = { ...input };
    // Do not allow the caller to override website identity or server-managed fields.
    delete data.websiteId;
    delete data.createdAt;
    delete data.type;

    const required =  ["name", "phone"] ;
    for (const field of required) {
      if (!String(data[field] ?? "").trim()) {
        return NextResponse.json({ success: false, error: `${field} is required` }, { status: 400 });
      }
    }

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === "string" && value.length > 10000) {
        return NextResponse.json({ success: false, error: `${key} is too long` }, { status: 413 });
      }
    }

    const id = randomUUID();
    const type = "contact";
    const response = await fetch(`${ADMIN_API_BASE_URL}/api/public-query`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        type,
        websiteId: CURRENT_WEBSITE_ID,
        id,
        data: { ...data, websiteId: CURRENT_WEBSITE_ID, createdAt: new Date().toISOString() },
      }),
      cache: "no-store",
    });

    const result = await response.json().catch(() => null);
    if (!response.ok || result?.success === false || result?.ok === false) {
      throw new Error(result?.error || `Admin API returned ${response.status}`);
    }

    return NextResponse.json({ success: true, id: result.id || id }, { status: 201 });
  } catch (error) {
    console.error("[api/contact-query] MongoDB submission failed:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to submit query" },
      { status: 502 }
    );
  }
}
