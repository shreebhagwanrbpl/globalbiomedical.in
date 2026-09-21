import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";

export const metadata = {
  metadataBase: new URL(
    "https://globalbiomedical.in"
  ),

  title:
    "Biomedical Equipment Supplier in India | Global Biomedical",

  description:
    "Global Biomedical supplies CBC Machines, Hematology Analyzers, Biochemistry Analyzers, ELISA Readers and laboratory equipment across India.",

  keywords: [
    "Biomedical Equipment Supplier",
    "Laboratory Equipment Supplier",
    "CBC Machine Supplier",
    "Hematology Analyzer Supplier",
    "Biochemistry Analyzer Supplier",
    "Diagnostic Equipment Supplier",
    "Medical Equipment Supplier India",
  ],

  openGraph: {
    title:
      "Biomedical Equipment Supplier in India | Global Biomedical",

    description:
      "Supplier of biomedical and laboratory equipment across India.",

    url: "https://globalbiomedical.in",

    siteName: "Global Biomedical",

    images: [
      {
        url: "/globallogo.png",
        width: 1200,
        height: 630,
        alt: "Global Biomedical",
      },
    ],

    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Biomedical Equipment Supplier in India | Global Biomedical",

    description:
      "Supplier of biomedical and laboratory equipment across India.",

    images: ["/globallogo.png"],
  },

  icons: {
    icon: [
      { url: "/globallogo.png", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [
      { url: "/globallogo.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/globallogo.png"],
  },

  alternates: {
    canonical: "https://globalbiomedical.in",
  },
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Navbar />

        <main>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
            }}
          />

          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}