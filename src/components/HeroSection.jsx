"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import heroBiomedical from "@/components/img/hero-biomedical.jpg";

import {
  ArrowRight,
  ShieldCheck,
  Microscope,
  BadgeCheck,
} from "lucide-react";

export default function HeroSection({ city }) {
  const [loading, setLoading] = useState(true);
  const [heroData, setHeroData] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchHeroData = async () => {
      try {
        const response = await fetch(
          "/api/site-data?type=home&websiteId=globalbiomedicalin&companyId=global",
          {
            cache: "no-store",
          }
        );

        const result = await response.json();

        console.log("[HeroSection] API response:", result);

        if (!isMounted) return;

        if (response.ok && result?.data) {
          setHeroData(result.data);
        } else {
          setHeroData(null);
        }
      } catch (error) {
        console.error("[HeroSection] Error fetching hero data:", error);

        if (isMounted) {
          setHeroData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchHeroData();

    return () => {
      isMounted = false;
    };
  }, []);

  /* -------------------------------------------------------
     District Routing
  ------------------------------------------------------- */

  const districtSlug = city
    ? city.toLowerCase().replace(/\s+/g, "-")
    : "";

  const makeLink = (path = "") => {
    if (!path) {
      return districtSlug ? `/${districtSlug}` : "/";
    }

    const target = path.startsWith("/") ? path : `/${path}`;

    return districtSlug ? `/${districtSlug}${target}` : target;
  };

  /* -------------------------------------------------------
     ADMIN DATA ONLY
     
     No static/default text fallback here.
  ------------------------------------------------------- */

  const titleText =
    typeof heroData?.title === "string"
      ? heroData.title.trim()
      : "";

  const descText =
    typeof heroData?.description === "string"
      ? heroData.description.trim()
      : "";

  const btn1Label =
    typeof heroData?.button1Text === "string"
      ? heroData.button1Text.trim()
      : "";

  const btn1Target =
    typeof heroData?.button1Link === "string"
      ? heroData.button1Link.trim()
      : "";

  const btn2Label =
    typeof heroData?.button2Text === "string"
      ? heroData.button2Text.trim()
      : "";

  const btn2Target =
    typeof heroData?.button2Link === "string"
      ? heroData.button2Link.trim()
      : "";

  return (
    <section className="gradient-bg overflow-hidden">
      <div className="container-custom min-h-[85vh] py-20 lg:py-0 grid lg:grid-cols-2 gap-14 items-center">

        {/* =====================================================
            LEFT CONTENT
        ====================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 70 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >

          {/* -------------------------------------------------
              Badge
              Existing UI kept unchanged
          -------------------------------------------------- */}

          <div className="inline-flex items-center gap-2 bg-sky-100 text-sky-700 px-4 py-2 rounded-full text-sm font-semibold mb-7">
            <ShieldCheck size={18} />
            Trusted Biomedical Systems
          </div>

          {/* -------------------------------------------------
              TITLE
              
              Admin data only.
          -------------------------------------------------- */}

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight text-slate-900">

            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-12 bg-gray-200 rounded w-[80%]"></div>
                <div className="h-12 bg-gray-200 rounded w-[60%]"></div>
                <div className="h-12 bg-gray-200 rounded w-[70%]"></div>
              </div>
            ) : titleText ? (
              <>
                {titleText}

                {city && (
                  <>
                    <br />

                    <span className="text-2xl lg:text-4xl text-sky-700 font-semibold">
                      in {city}
                    </span>
                  </>
                )}
              </>
            ) : null}

          </h1>

          {/* -------------------------------------------------
              DESCRIPTION
              
              Admin data only.
          -------------------------------------------------- */}

          {loading ? (
            <div className="animate-pulse mt-7 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-[90%]"></div>
              <div className="h-4 bg-gray-200 rounded w-[75%]"></div>
            </div>
          ) : descText ? (
            <p className="mt-7 text-slate-600 text-lg leading-8 max-w-xl">
              {descText}

              {city && (
                <>
                  {" "}
                  across <strong>{city}</strong>
                </>
              )}
            </p>
          ) : null}

          {/* -------------------------------------------------
              BUTTONS
              
              Admin text only.
              
              If button text exists:
              - link exists  → clickable Link
              - link empty   → normal button
              
              No static fallback text.
          -------------------------------------------------- */}

          {!loading && (btn1Label || btn2Label) ? (
            <div className="flex flex-col sm:flex-row gap-4 mt-10">

              {/* BUTTON 1 */}

              {btn1Label ? (
                btn1Target ? (
                  <Link href={makeLink(btn1Target)}>
                    <button
                      type="button"
                      className="primary-btn flex items-center gap-2"
                    >
                      {btn1Label}
                      <ArrowRight size={18} />
                    </button>
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="primary-btn flex items-center gap-2"
                  >
                    {btn1Label}
                    <ArrowRight size={18} />
                  </button>
                )
              ) : null}

              {/* BUTTON 2 */}

              {btn2Label ? (
                btn2Target ? (
                  <Link href={makeLink(btn2Target)}>
                    <button
                      type="button"
                      className="secondary-btn"
                    >
                      {btn2Label}
                    </button>
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="secondary-btn"
                  >
                    {btn2Label}
                  </button>
                )
              ) : null}

            </div>
          ) : null}

          {/* =================================================
              STATS
              
              Existing UI kept as-is.
          ================================================== */}

          <div className="flex flex-wrap gap-8 mt-12">

            <div>
              <h3 className="text-3xl font-bold text-slate-900">
                10+
              </h3>

              <p className="text-slate-500">
                Years Experience
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-slate-900">
                500+
              </h3>

              <p className="text-slate-500">
                Products Delivered
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-slate-900">
                100%
              </h3>

              <p className="text-slate-500">
                Quality Assurance
              </p>
            </div>

          </div>

        </motion.div>

        {/* =====================================================
            RIGHT SIDE
        ====================================================== */}

        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >

          {/* -------------------------------------------------
              Existing Image
              
              DO NOT CHANGE IMAGE FALLBACK / SOURCE LOGIC
          -------------------------------------------------- */}

          <div className="glass-card rounded-[40px] p-4 sm:p-5 card-shadow">

            <Image
              src={heroBiomedical}
              alt="Global Biomedical Laboratory & Diagnostic Equipment"
              width={1200}
              height={900}
              priority
              className="rounded-[28px] object-cover object-center h-[350px] sm:h-[450px] lg:h-[550px] w-full"
            />

          </div>

          {/* -------------------------------------------------
              Floating Card 1
              
              Existing design kept
          -------------------------------------------------- */}

          <div
            className="absolute top-10 -left-10 bg-white p-5 rounded-3xl shadow-xl hidden lg:flex items-center gap-4"
            style={{ marginTop: "-27px" }}
          >

            <div className="bg-sky-100 p-3 rounded-2xl">
              <Microscope className="text-sky-700" />
            </div>

            <div>
              <h4 className="font-semibold">
                Modern Labs
              </h4>

              <p className="text-sm text-slate-500">
                Precision Equipment
              </p>
            </div>

          </div>

          {/* -------------------------------------------------
              Floating Card 2
              
              Existing design kept
          -------------------------------------------------- */}

          <div className="absolute bottom-10 -right-8 bg-white p-5 rounded-3xl shadow-xl hidden lg:flex items-center gap-4">

            <div className="bg-teal-100 p-3 rounded-2xl">
              <BadgeCheck className="text-teal-700" />
            </div>

            <div>
              <h4 className="font-semibold">
                Trusted Quality
              </h4>

              <p className="text-sm text-slate-500">
                Certified Solutions
              </p>
            </div>

          </div>

        </motion.div>

      </div>
    </section>
  );
}