import { NextResponse } from "next/server";
import { fetchFullCatalog } from "@/lib/data-fetcher";
import { CURRENT_DOMAIN } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const products = await fetchFullCatalog({ forceRefresh: true });

    const categoriesMap = {};
    products.forEach((p) => {
      const cat = p.category || "General";
      const sub = p.subCategory || cat;
      if (!categoriesMap[cat]) categoriesMap[cat] = {};
      if (!categoriesMap[cat][sub]) categoriesMap[cat][sub] = [];
      categoriesMap[cat][sub].push(p);
    });

    let text = `# Global Biomedical - Medical Laboratory & Diagnostic Equipment Supplier\n\n`;
    text += `> Global Biomedical is a premier supplier, dealer, and distributor of high-precision diagnostic and biomedical equipment across India.\n\n`;
    text += `## Core Information\n`;
    text += `- **Website**: https://${CURRENT_DOMAIN}\n`;
    text += `- **Primary Catalog**: https://${CURRENT_DOMAIN}/items\n`;
    text += `- **Total Active Products**: ${products.length}\n`;
    text += `- **Coverage**: All districts and healthcare institutions across India\n\n`;

    text += `## Master Product Catalog\n\n`;

    for (const [category, subcategories] of Object.entries(categoriesMap)) {
      text += `### Category: ${category}\n`;
      for (const [subCategory, prods] of Object.entries(subcategories)) {
        text += `#### Subcategory: ${subCategory} (${prods.length} items)\n`;
        for (const prod of prods) {
          const prodUrl = `https://${CURRENT_DOMAIN}/items/${prod.slug || prod.id}`;
          text += `- [${prod.title}](${prodUrl})`;
          if (prod.brand) text += ` | Brand: ${prod.brand}`;
          if (prod.model) text += ` | Model: ${prod.model}`;
          if (prod.price) text += ` | Price: ₹${prod.price}`;
          text += `\n`;
        }
        text += `\n`;
      }
    }

    text += `## Main Website Sections\n`;
    text += `- Home: https://${CURRENT_DOMAIN}/\n`;
    text += `- About Us: https://${CURRENT_DOMAIN}/about\n`;
    text += `- Services: https://${CURRENT_DOMAIN}/services\n`;
    text += `- Products Catalog: https://${CURRENT_DOMAIN}/items\n`;
    text += `- Contact & Inquiries: https://${CURRENT_DOMAIN}/contact\n`;

    return new NextResponse(text, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    });
  } catch (error) {
    console.error("[llms.txt] Error generating llms.txt:", error);
    return new NextResponse("# Global Biomedical\nError generating live product catalog.", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
