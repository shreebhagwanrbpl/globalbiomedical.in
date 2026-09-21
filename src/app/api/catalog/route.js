import { NextResponse } from "next/server";
import { fetchFullCatalog } from "@/lib/data-fetcher";
import { CURRENT_COMPANY_ID, CURRENT_WEBSITE_ID } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get("websiteId") || CURRENT_WEBSITE_ID;
    const companyId = searchParams.get("companyId") || CURRENT_COMPANY_ID;

    const products = await fetchFullCatalog({
      forceRefresh: true,
      websiteId,
      companyId,
    });

    return NextResponse.json(
      {
        success: true,
        websiteId,
        companyId,
        count: products.length,
        products,
        timestamp: Date.now(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          "CDN-Cache-Control": "no-store",
          "Vercel-CDN-Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("[api/catalog] Error fetching live catalog:", error);
    return NextResponse.json(
      {
        success: false,
        count: 0,
        products: [],
        error: error.message || "Failed to fetch catalog",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
