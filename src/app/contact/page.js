"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Mail,
  Phone,
  MapPin,
  Clock3,
} from "lucide-react";

import PageBanner from "@/components/PageBanner";
import CTASection from "@/components/CTASection";

import { extractContactDetails, fetchDocCached } from "@/lib/data-fetcher";
import { CURRENT_WEBSITE_ID } from "@/lib/constants";

export default function ContactPage() {
  const [loading, setLoading] = useState(true);
  const [districtData, setDistrictData] = useState(null);
  const [contactData, setContactData] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const pathname = usePathname();

  const pathParts = pathname
    .split("/")
    .filter(Boolean);

  const currentDistrict =
    pathParts.length > 0 &&
    !["about", "services", "items", "contact"].includes(pathParts[0])
      ? pathParts[0]
      : null;

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const phoneRegex =
      /^[6-9]\d{9}$/;

    if (!form.name.trim()) {
      return toast.error(
        "Name is required"
      );
    }

    if (!emailRegex.test(form.email)) {
      return toast.error(
        "Enter valid email"
      );
    }

    if (!phoneRegex.test(form.phone)) {
      return toast.error(
        "Enter valid mobile number"
      );
    }

    if (!form.message.trim()) {
      return toast.error(
        "Message is required"
      );
    }

    try {
      setSubmitting(true);

      const response = await fetch("/api/contact-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const resJson = await response.json().catch(() => null);

      if (!response.ok || resJson?.success === false) {
        throw new Error(resJson?.error || "Failed to submit message");
      }

      toast.success(
        "Message submitted successfully"
      );

      setForm({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      console.error(err);
      toast.error(
        err?.message || "Something went wrong"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    const loadDistrict = async () => {
      if (!currentDistrict) return;

      try {
        const data = await fetchDocCached(
          `websites/${CURRENT_WEBSITE_ID}/districts/${currentDistrict}`
        );

        if (data) {
          setDistrictData(data);
        }
      } catch (err) {
        console.log(err);
      }
    };

    loadDistrict();
  }, [currentDistrict]);

  useEffect(() => {
    const loadContact = async () => {
      try {
        const data = await fetchDocCached(`websites/${CURRENT_WEBSITE_ID}/pages/contact`);
        if (data) {
          setContactData(data);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    loadContact();
  }, []);

  const contact = extractContactDetails(contactData);
  const phone = contact.phone || "";
  const email = contact.email || "";
  const address = contact.address || "";
  const hours = contact.hours || "";

  const dynamicAddress =
    districtData?.district && districtData?.state
      ? `${districtData.district}, ${districtData.state}, India`
      : address;

  const mapAddress = encodeURIComponent(
    dynamicAddress
  );
  if (loading) {
    return (
      <section className="section-padding">
        <div className="container-custom">

          <div className="grid lg:grid-cols-2 gap-12">

            <div>
              <div className="h-12 w-64 bg-slate-200 rounded animate-pulse mb-8" />

              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-28 bg-slate-200 rounded-3xl animate-pulse mb-6"
                />
              ))}
            </div>

            <div className="bg-white p-10 rounded-3xl">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-14 bg-slate-200 rounded-2xl animate-pulse mb-5"
                />
              ))}
            </div>

          </div>

        </div>
      </section>
    );
  }
  return (
    <>
      {/* Banner */}
      <PageBanner
        title="Contact Us"
        subtitle="Get in touch with Global Biomedical for premium diagnostic and biomedical solutions."
      />

      {/* Contact Section */}
      <section className="section-padding bg-white">
        <div className="container-custom grid lg:grid-cols-2 gap-14">

          {/* Left Info */}
          <div>

            <span className="inline-block bg-sky-100 text-sky-700 px-5 py-2 rounded-full font-semibold mb-5">
              Contact Information
            </span>

            <h2 className="section-title">
              Let’s Start a Conversation
            </h2>

            <p className="section-subtitle">
              Reach out to us for
              healthcare consultation,
              biomedical products, and
              advanced diagnostic support.
            </p>

            {/* Contact Cards */}
            <div className="space-y-6 mt-10">

              <div className="flex items-start gap-5 bg-slate-50 p-6 rounded-[28px] border border-slate-100">
                <div className="w-14 h-14 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-700">
                  <Phone size={24} />
                </div>

                <div>
                  <h4 className="font-semibold text-lg">
                    Phone Number
                  </h4>

                  {phone ? (
                    <p className="text-slate-600 mt-2">{phone}</p>
                  ) : null}
                </div>
              </div>

              <div className="flex items-start gap-5 bg-slate-50 p-6 rounded-[28px] border border-slate-100">
                <div className="w-14 h-14 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-700">
                  <Mail size={24} />
                </div>

                <div>
                  <h4 className="font-semibold text-lg">
                    Email Address
                  </h4>

                  {email ? (
                    <p className="text-slate-600 mt-2">{email}</p>
                  ) : null}
                </div>
              </div>

              <div className="flex items-start gap-5 bg-slate-50 p-6 rounded-[28px] border border-slate-100">
                <div className="w-14 h-14 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-700">
                  <MapPin size={24} />
                </div>

                <div>
                  <h4 className="font-semibold text-lg">
                    Office Address
                  </h4>

                  {dynamicAddress ? (
                    <p className="text-slate-600 mt-2">{dynamicAddress}</p>
                  ) : null}
                </div>
              </div>

              <div className="flex items-start gap-5 bg-slate-50 p-6 rounded-[28px] border border-slate-100">
                <div className="w-14 h-14 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-700">
                  <Clock3 size={24} />
                </div>

                <div>
                  <h4 className="font-semibold text-lg">
                    Working Hours
                  </h4>

                  {hours ? (
                    <p className="text-slate-600 mt-2">{hours}</p>
                  ) : null}
                </div>
              </div>

            </div>
          </div>

          {/* Right Form */}
          <div className="bg-white rounded-[40px] p-8 lg:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">

            <h3 className="text-3xl font-bold text-slate-900">
              Send Us Message
            </h3>

            <p className="text-slate-500 mt-3">
              Fill out the form and our
              team will contact you soon.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >

              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-sky-600"
              />

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-sky-600"
              />

              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                maxLength={10}
                value={form.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone: e.target.value.replace(/\D/g, ""),
                  })
                }
                className="w-full border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-sky-600"
              />

              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={form.subject}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-sky-600"
              />

              <textarea
                rows={5}
                name="message"
                placeholder="Your Message"
                value={form.message}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-sky-600 resize-none"
              />

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-sky-700 text-white py-4 rounded-2xl font-semibold hover:bg-sky-800 transition"
              >
                {submitting
                  ? "Submitting..."
                  : "Send Message"}
              </button>

            </form>
          </div>
        </div>
      </section>

      {/* Google Map */}
      <section className="pb-24 bg-white">
        <div className="container-custom">
          <div className="rounded-[40px] overflow-hidden border border-slate-100 card-shadow">

            <iframe
              src={`https://maps.google.com/maps?q=${mapAddress}&z=13&output=embed`}
              width="100%"
              height="500"
              loading="lazy"
              className="border-0 w-full"
            ></iframe>

          </div>
        </div>
      </section>

      {/* CTA */}
      <CTASection />
    </>
  );
}