import ProductDetails from "../../../items/[slug]/ProductDetails";
import { fetchProductBySlug } from "@/lib/data-fetcher";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }) {
    const { slug, district } = await params;
    const product = await fetchProductBySlug(slug);

    const cityName = district
        ? district.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
        : "India";

    const productName =
        product?.title ||
        product?.name ||
        slug?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    const title = `${productName} Supplier in ${cityName} | Global Biomedical`;
    const description = `Buy ${productName} in ${cityName} at best price. Trusted supplier, dealer and distributor of ${productName}. Contact Global Biomedical.`;
    const ogImage = product?.images?.[0] || product?.image || "/globallogo.png";

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [{ url: ogImage, width: 1200, height: 630, alt: productName }],
        },
        robots: {
            index: product ? true : false,
            follow: product ? true : false,
        },
    };
}

export default async function Page({ params }) {
    const { slug, district } = await params;

    return (
        <ProductDetails
            slug={slug}
            district={district}
        />
    );
}