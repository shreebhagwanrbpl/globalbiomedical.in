
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Microscope,
  BadgeCheck,
  Activity,
} from "lucide-react";

import heroBiomedical from "@/components/img/hero-biomedical.jpg";

export default function HeroSection({ city }) {
  const [loading, setLoading] = useState(true);
  const [heroData, setHeroData] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function fetchHeroData() {
      try {
        const response = await fetch(
          "/api/site-data?type=home&websiteId=globalbiomedicalin&companyId=global",
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const result = await response.json();

        if (!isMounted) return;

        if (response.ok && result?.data) {
          setHeroData(result.data);
        } else {
          setHeroData(null);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Hero data fetch failed:", error);

          if (isMounted) {
            setHeroData(null);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchHeroData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  // District-aware routing
  const districtSlug = city
    ? city.toLowerCase().trim().replace(/\s+/g, "-")
    : "";

  const makeLink = (path = "") => {
    if (!path) {
      return districtSlug ? `/${districtSlug}` : "/";
    }

    const target = path.startsWith("/") ? path : `/${path}`;

    return districtSlug
      ? `/${districtSlug}${target}`
      : target;
  };

  // Dynamic content from Admin API
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
    <section className="relative isolate overflow-hidden bg-[#fffafb]">
      {/* Soft background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-0 -z-10 h-[420px] w-[420px] rounded-full bg-pink-100/50 blur-[100px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 bottom-0 -z-10 h-[420px] w-[420px] rounded-full bg-rose-100/50 blur-[110px]"
      />

      <div className="container-custom relative grid min-h-[auto] items-center gap-12 py-12 sm:py-16 lg:min-h-[calc(100svh-88px)] lg:grid-cols-2 lg:gap-10 lg:py-14 xl:gap-16">
        {/* LEFT CONTENT */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="relative z-10 mx-auto w-full max-w-[680px] lg:mx-0"
        >
          {/* Trust badge */}
          <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-rose-100 bg-white/90 px-4 py-2 shadow-sm shadow-rose-100/50">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-50">
              <ShieldCheck
                size={17}
                className="text-rose-600"
              />
            </span>

            <span className="text-xs font-bold tracking-wide text-slate-700 sm:text-sm">
              Trusted Biomedical Systems
            </span>
          </div>

          {/* Dynamic heading */}
          <h1 className="max-w-full break-words text-balance text-[clamp(2.5rem,4.1vw,4.5rem)] font-extrabold leading-[1.07] tracking-[-0.045em] text-slate-950">
            {loading ? (
              <span
                aria-label="Loading heading"
                className="block animate-pulse space-y-3"
              >
                <span className="block h-10 w-[90%] rounded-xl bg-slate-200 sm:h-14 lg:h-16" />
                <span className="block h-10 w-[72%] rounded-xl bg-slate-200 sm:h-14 lg:h-16" />
                <span className="block h-10 w-[82%] rounded-xl bg-slate-200 sm:h-14 lg:h-16" />
              </span>
            ) : (
              <>
                {titleText || null}

                {city && titleText && (
                  <span className="mt-2 block text-[clamp(1.5rem,2.5vw,2.2rem)] font-semibold leading-tight tracking-[-0.025em] text-rose-600">
                    in {city}
                  </span>
                )}
              </>
            )}
          </h1>

          {/* Dynamic description */}
          {loading ? (
            <div className="mt-6 max-w-xl animate-pulse space-y-3">
              <div className="h-4 w-full rounded bg-slate-200" />
              <div className="h-4 w-[92%] rounded bg-slate-200" />
              <div className="h-4 w-[70%] rounded bg-slate-200" />
            </div>
          ) : descText ? (
            <p className="mt-6 max-w-[570px] text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              {descText}
              {city && (
                <>
                  {" "}Serving healthcare professionals across{" "}
                  <strong className="font-semibold text-slate-800">
                    {city}
                  </strong>
                  .
                </>
              )}
            </p>
          ) : null}

          {/* Dynamic CTA buttons */}
          {!loading && (btn1Label || btn2Label) && (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              {btn1Label &&
                (btn1Target ? (
                  <Link
                    href={makeLink(btn1Target)}
                    className="inline-flex min-h-[54px] items-center justify-center gap-3 rounded-xl bg-rose-600 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-rose-600/20 transition duration-200 hover:-translate-y-0.5 hover:bg-rose-700 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-200 sm:text-base"
                  >
                    {btn1Label}
                    <ArrowRight size={19} />
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="inline-flex min-h-[54px] items-center justify-center gap-3 rounded-xl bg-rose-600 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700 sm:text-base"
                  >
                    {btn1Label}
                    <ArrowRight size={19} />
                  </button>
                ))}

              {btn2Label &&
                (btn2Target ? (
                  <Link
                    href={makeLink(btn2Target)}
                    className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-4 text-sm font-bold text-slate-800 transition duration-200 hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-50 sm:text-base"
                  >
                    {btn2Label}
                    <ArrowRight size={18} />
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-4 text-sm font-bold text-slate-800 transition hover:border-rose-200 hover:bg-rose-50 sm:text-base"
                  >
                    {btn2Label}
                  </button>
                ))}
            </div>
          )}

          {/* Existing stats */}
          <div className="mt-10 grid max-w-[580px] grid-cols-3 border-t border-rose-100 pt-6 sm:mt-12 sm:pt-7">
            <div className="pr-3 sm:pr-5">
              <div className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                10+
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                Years Experience
              </p>
            </div>

            <div className="border-l border-rose-100 px-3 sm:px-5">
              <div className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                500+
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                Products Delivered
              </p>
            </div>

            <div className="border-l border-rose-100 pl-3 sm:pl-5">
              <div className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                100%
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                Quality Assurance
              </p>
            </div>
          </div>
        </motion.div>

        {/* RIGHT IMAGE */}
        <motion.div
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.12,
            ease: "easeOut",
          }}
          className="relative mx-auto w-full max-w-[650px] lg:ml-auto lg:mr-0"
        >
          {/* Decorative image background */}
          <div
            aria-hidden="true"
            className="absolute inset-5 translate-x-3 translate-y-3 rounded-[32px] bg-rose-100/80 sm:inset-7 sm:translate-x-4 sm:translate-y-4"
          />

          {/* Main image card */}
          <div className="relative overflow-hidden rounded-[28px] border border-white bg-white p-2.5 shadow-[0_24px_80px_rgba(80,30,50,0.12)] sm:rounded-[34px] sm:p-3.5">
            <div className="relative overflow-hidden rounded-[22px] bg-slate-100 sm:rounded-[27px]">
              <Image
                src={heroBiomedical}
                alt="Biomedical laboratory and diagnostic equipment"
                width={1200}
                height={900}
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 48vw"
                className="h-[300px] w-full object-cover object-center sm:h-[420px] lg:h-[460px] xl:h-[520px]"
              />

              {/* Image overlay */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent" />

              {/* Image bottom label */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 rounded-2xl border border-white/50 bg-white/90 p-3 shadow-lg backdrop-blur-md sm:bottom-5 sm:left-5 sm:right-5 sm:p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 sm:h-12 sm:w-12">
                    <Activity size={23} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900 sm:text-base">
                      Advanced Diagnostics
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                      Biomedical Equipment
                    </p>
                  </div>
                </div>

                <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-600 text-white sm:flex">
                  <ArrowRight size={18} />
                </div>
              </div>
            </div>
          </div>

          {/* Floating card: desktop */}
          <div className="absolute -left-5 top-12 hidden items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_12px_40px_rgba(15,23,42,0.10)] xl:flex">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <Microscope size={24} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">
                Modern Labs
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Precision Equipment
              </p>
            </div>
          </div>

          {/* Floating card: desktop */}
          <div className="absolute -right-3 top-[45%] hidden items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-[0_12px_40px_rgba(15,23,42,0.10)] xl:flex">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <BadgeCheck size={23} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">
                Trusted Quality
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Healthcare Solutions
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
