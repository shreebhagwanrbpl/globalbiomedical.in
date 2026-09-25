import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ADMIN_API_BASE =
  process.env.ADMIN_API_BASE_URL || "https://admin.rajbiosis.app";

async function fetchAdmin(path) {
  const response = await fetch(`${ADMIN_API_BASE}${path}`, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(json?.error || `Admin API returned ${response.status}`);
  }

  return json;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const websiteId = searchParams.get("websiteId") || "globalbiomedicalin";
    const companyId = searchParams.get("companyId") || "global";
    const slug = searchParams.get("slug");

    if (!type) {
      return NextResponse.json(
        { success: false, error: "type is required", data: null },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({
      type,
      websiteId,
      companyId,
    });

    if (slug) params.set("slug", slug);

    const json = await fetchAdmin(`/api/site-data?${params.toString()}`);

    return NextResponse.json(json, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      },
    });
  } catch (error) {
    console.error("[api/site-data] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to load site data",
        data: null,
      },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}
