import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { fetchFullCatalog } from "@/lib/data-fetcher";

export default async function sitemap() {
    const baseUrl =
        "https://globalbiomedical.in";

    const urls = [];

    // Static Pages
    urls.push(
        {
            url: baseUrl,
            lastModified: new Date(),
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
        },
        {
            url: `${baseUrl}/services`,
            lastModified: new Date(),
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
        },
        {
            url: `${baseUrl}/items`,
            lastModified: new Date(),
        }
    );

    try {
        // DISTRICTS
        const districtSnap =
            await getDocs(
                collection(
                    db,
                    "websites",
                    "globalbiomedicalin",
                    "districts"
                )
            );

        const districts =
            districtSnap.docs.map(
                (doc) => doc.data()
            );

        districts.forEach((district) => {
            const slug =
                district.slug;

            if (!slug) return;

            urls.push(
                {
                    url: `${baseUrl}/${slug}`,
                    lastModified:
                        new Date(),
                },
                {
                    url: `${baseUrl}/${slug}/about`,
                    lastModified:
                        new Date(),
                },
                {
                    url: `${baseUrl}/${slug}/services`,
                    lastModified:
                        new Date(),
                },
                {
                    url: `${baseUrl}/${slug}/contact`,
                    lastModified:
                        new Date(),
                },
                {
                    url: `${baseUrl}/${slug}/items`,
                    lastModified:
                        new Date(),
                }
            );
        });

        // MASTER CATALOG PRODUCTS
        const products = await fetchFullCatalog({ forceRefresh: true });

        products.forEach((product) => {
            const prodSlug = product.slug || product.id;
            if (!prodSlug) return;

            // Main Product URL
            urls.push({
                url: `${baseUrl}/items/${prodSlug}`,
                lastModified: new Date(),
            });

            // District Product URLs
            districts.forEach((district) => {
                const distSlug = district.slug;
                if (!distSlug) return;

                urls.push({
                    url: `${baseUrl}/${distSlug}/items/${prodSlug}`,
                    lastModified: new Date(),
                });
            });
        });
    } catch (error) {
        console.error("Sitemap Error:", error);
    }

    return urls;
}