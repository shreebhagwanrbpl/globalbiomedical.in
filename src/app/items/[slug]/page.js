import ProductDetails from "./ProductDetails";
import { fetchProductBySlug } from "@/lib/data-fetcher";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const product = await fetchProductBySlug(slug);

    const productName =
        product?.title ||
        product?.name ||
        slug
            ?.replace(/-/g, " ")
            ?.replace(/\b\w/g, (c) => c.toUpperCase());

    const title = `${productName} Supplier in India | Price, Dealer & Distributor | Global Biomedical`;

    const description =
        product?.desc ||
        product?.description ||
        `Buy ${productName} at best price in India. Trusted supplier, dealer and distributor of ${productName} for hospitals, laboratories, diagnostic centers, research institutes and healthcare facilities. Contact Global Biomedical for latest quotation and product details.`;

    const url = `https://globalbiomedical.in/items/${slug}`;
    const ogImage = product?.images?.[0] || product?.image || "/globallogo.png";

    return {
        title,
        description,

        keywords: [
            productName,
            `${productName} Supplier`,
            `${productName} Dealer`,
            `${productName} Distributor`,
            `${productName} Manufacturer`,
            `${productName} Exporter`,
            `${productName} Price`,
            `${productName} Price in India`,
            `${productName} Supplier in India`,
            `${productName} Dealer in India`,
            `${productName} Distributor in India`,
            `Buy ${productName}`,
            `${productName} for Laboratory`,
            `${productName} for Hospital`,
            `${productName} for Diagnostic Center`,
            "Biomedical Equipment",
            "Medical Equipment",
            "Laboratory Equipment",
            "Diagnostic Equipment",
            "Hospital Equipment",
            "Healthcare Equipment",
            "Global Biomedical",
        ],

        alternates: {
            canonical: url,
        },

        openGraph: {
            title,
            description,
            url,
            siteName: "Global Biomedical",
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: productName,
                },
            ],
            type: "website",
            locale: "en_IN",
        },

        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [ogImage],
        },

        robots: {
            index: product ? true : false,
            follow: product ? true : false,
            googleBot: {
                index: product ? true : false,
                follow: product ? true : false,
                "max-video-preview": -1,
                "max-image-preview": "large",
                "max-snippet": -1,
            },
        },

        metadataBase: new URL("https://globalbiomedical.in"),
    };
}

export default async function Page({ params }) {
    const { slug } = await params;

    return <ProductDetails slug={slug} />;
}