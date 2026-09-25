import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ADMIN_API_BASE =
  process.env.ADMIN_API_BASE_URL || "https://admin.rajbiosis.app";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get("websiteId") || "globalbiomedicalin";
    const companyId = searchParams.get("companyId") || "global";

    const params = new URLSearchParams({ websiteId, companyId });

    const response = await fetch(
      `${ADMIN_API_BASE}/api/catalog?${params.toString()}`,
      {
        cache: "no-store",
        headers: { Accept: "application/json" },
      }
    );

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(json?.error || `Admin API returned ${response.status}`);
    }

    return NextResponse.json(json, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      },
    });
  } catch (error) {
    console.error("[api/catalog] Error:", error);

    return NextResponse.json(
      {
        success: false,
        count: 0,
        products: [],
        error: error?.message || "Failed to fetch catalog",
      },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}
