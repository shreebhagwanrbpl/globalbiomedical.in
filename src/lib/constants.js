export const COMPANY_WEBSITES = {
  human: [
    "humanbiomedicalscom",
    "humanbiomedicalsin",
    "humanbiomedicalin",
    "humanbiomedicalcom",
    "humanbiomedicalorg",
    "humanbiomedicalcoin",
  ],
  global: [
    "globalbiomedicalin",
    "globalbiomedicalorg",
    "globalbiomedicalcoin",
    "globalbiomedicalsin",
    "globalbiomedicalsnet",
    "globalhealthkartcom",
  ],
  rajbiosis: [
    "indiandiagnostic",
    "centralbiomedicals",
    "humarilabin",
    "humarilabcom",
    "rajbiosisinfo",
    "rajbiosiscoin",
    "rajbiosisltd",
    "ozonexco",
    "aozellocom",
    "aozallocom",
    "ozallecom",
    "ozallocom",
    "ozellein",
    "qlytein",
    "qlyserin",
    "anylabtestin",
    "radioimmunoassayin",
    "bloodmixerin",
    "glucostripscom",
    "glucometersin",
    "safekitin",
    "haemoglobinstripcom",
    "haemoglobinstripscom",
    "haemoglobinmetercom",
    "hemoglobinstripcom",
    "hemoglobinstripin",
    "hemoglobinstripscom",
    "hemoglobinmetercom",
    "hemoglobinmeterin",
    "cliakitscom",
    "clinicalchemistryin",
    "medicalsjobportalcom",
    "tublerin",
    "clinidixcom",
    "oleturcom",
    "indiandiagnosticscom",
    "cliakitsin",
    "radioimmunoassaycoin",
    "centralbiomedicalsin",
    "diagnostatcom",
    "diagnosticbloomcom",
    "diagnotexcom",
    "biohaloscom",
    "diagnosticsbloomcom",
    "globalhealthdirectorycom",
    "humanbiomedicalscom",
    "dxgelcom",
    "globalhealthcartcom",
    "medflixbiomedicalcom",
    "medflixbiomedicalscom",
    "qlysercom",
    "ichromain",
    "spinreactin",
    "rajvedcom",
    "coolpacksin",
    "hamarilabcom",
    "qlyte",
  ],
};

export const COMPANIES = ["global", "human", "rajbiosis"];

export const getCompanyDisplayName = (companyId) => {
  switch (companyId) {
    case "human":
      return "Human Biomedical";
    case "global":
      return "Global Biomedical";
    case "rajbiosis":
      return "RajBiosis";
    default:
      return "Global Biomedical";
  }
};

/**
 * Strips dots, hyphens, underscores, spaces and lowercases.
 * Examples:
 * "globalbiomedical.in" -> "globalbiomedicalin"
 * "global-biomedical.in" -> "globalbiomedicalin"
 * "globalbiomedical.co.in" -> "globalbiomedicalcoin"
 */
export function normalizeWebsiteId(str = "") {
  return String(str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "");
}

export function makeSlug(text = "") {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export const CURRENT_DOMAIN = "globalbiomedical.in";

export const CURRENT_WEBSITE_ID = normalizeWebsiteId(
  typeof process !== "undefined" && process.env?.NEXT_PUBLIC_WEBSITE_ID
    ? process.env.NEXT_PUBLIC_WEBSITE_ID
    : CURRENT_DOMAIN
); // "globalbiomedicalin"

export function detectCompanyId() {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_COMPANY_ID) {
    return process.env.NEXT_PUBLIC_COMPANY_ID.toLowerCase().trim();
  }
  const currentNorm = CURRENT_WEBSITE_ID;
  for (const [compId, sites] of Object.entries(COMPANY_WEBSITES)) {
    if (sites.some((s) => normalizeWebsiteId(s) === currentNorm)) {
      return compId;
    }
  }
  if (currentNorm.includes("global")) return "global";
  if (currentNorm.includes("human")) return "human";
  if (currentNorm.includes("rajbiosis")) return "rajbiosis";
  return "global";
}

export const CURRENT_COMPANY_ID = detectCompanyId();

/**
 * Bulletproof Visibility Logic:
 * - isPublished === false -> Hide (false)
 * - status === 'inactive' or 'hidden' -> Hide (false)
 * - websiteIds is [] (empty array, 0 websites) -> Hide (false)
 * - websiteIds.includes('all') -> Show (true)
 * - websiteIds includes normalized target website -> Show (true)
 */
export function isVisibleForWebsite(item, websiteId = CURRENT_WEBSITE_ID) {
  if (!item) return false;

  // 1. Explicit publish / status flags
  if (item.isPublished === false) return false;
  if (item.status === "inactive" || item.status === "hidden") return false;

  // 2. WebsiteIds check
  const rawWebsites = item.websiteIds;
  if (!Array.isArray(rawWebsites) || rawWebsites.length === 0) {
    return false; // 0 websites assigned -> Hide
  }

  const normalizedTarget = normalizeWebsiteId(websiteId);

  return rawWebsites.some((w) => {
    const norm = normalizeWebsiteId(w);
    return norm === "all" || norm === normalizedTarget;
  });
}
