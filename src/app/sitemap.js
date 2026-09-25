import { fetchFullCatalog } from "@/lib/data-fetcher";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ADMIN_API_BASE =
    process.env.ADMIN_API_BASE_URL || "https://admin.rajbiosis.app";

async function fetchAdminDistricts() {
    try {
        const params = new URLSearchParams({
            type: "districts",
            websiteId: "globalbiomedicalin",
            companyId: "global",
        });

        const response = await fetch(
            `${ADMIN_API_BASE}/api/site-data?${params.toString()}`,
            { cache: "no-store" }
        );

        if (!response.ok) return [];

        const json = await response.json();
        return Array.isArray(json?.districts)
            ? json.districts
            : Array.isArray(json?.data)
                ? json.data
                : [];
    } catch (error) {
        console.error("[sitemap] Admin districts error:", error);
        return [];
    }
}

export default async function sitemap() {
    const baseUrl = "https://globalbiomedical.in";
    const urls = [
        { url: baseUrl, lastModified: new Date() },
        { url: `${baseUrl}/about`, lastModified: new Date() },
        { url: `${baseUrl}/services`, lastModified: new Date() },
        { url: `${baseUrl}/contact`, lastModified: new Date() },
        { url: `${baseUrl}/items`, lastModified: new Date() },
    ];

    try {
        const districts = await fetchAdminDistricts();

        districts.forEach((district) => {
            const slug = district?.slug;
            if (!slug) return;

            urls.push(
                { url: `${baseUrl}/${slug}`, lastModified: new Date() },
                { url: `${baseUrl}/${slug}/about`, lastModified: new Date() },
                { url: `${baseUrl}/${slug}/services`, lastModified: new Date() },
                { url: `${baseUrl}/${slug}/contact`, lastModified: new Date() },
                { url: `${baseUrl}/${slug}/items`, lastModified: new Date() }
            );
        });

        const products = await fetchFullCatalog({ forceRefresh: true });

        products.forEach((product) => {
            const prodSlug = product?.slug || product?.id;
            if (!prodSlug) return;

            urls.push({
                url: `${baseUrl}/items/${prodSlug}`,
                lastModified: new Date(),
            });

            districts.forEach((district) => {
                const distSlug = district?.slug;
                if (!distSlug) return;

                urls.push({
                    url: `${baseUrl}/${distSlug}/items/${prodSlug}`,
                    lastModified: new Date(),
                });
            });
        });
    } catch (error) {
        console.error("[sitemap] Error:", error);
    }

    return urls;
}
