import { NextResponse } from "next/server";
import { CURRENT_WEBSITE_ID } from "@/lib/constants";

const ADMIN_API_URL = (
  process.env.ADMIN_API_BASE_URL ||
  process.env.ADMIN_API_URL ||
  process.env.SQLITE_ADMIN_API_URL ||
  "https://admin.rajbiosis.app"
).replace(/\/$/, "");

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const data = await request.json();
    const docId = crypto.randomUUID();

    const response = await fetch(`${ADMIN_API_URL}/api/local-firestore`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        op: "set",
        path: `websitesQueries/${CURRENT_WEBSITE_ID}/productQueries/${docId}`,
        data: {
          ...data,
          websiteId: CURRENT_WEBSITE_ID,
          createdAt: new Date().toISOString(),
        },
      }),
      cache: "no-store",
    });

    const json = await response.json().catch(() => null);
    if (!response.ok || json?.ok === false) {
      throw new Error(json?.error || `Admin API returned ${response.status}`);
    }

    return NextResponse.json({ success: true, id: docId }, { status: 200 });
  } catch (error) {
    console.error("[api/product-query] Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to submit product query" },
      { status: 500 }
    );
  }
}
