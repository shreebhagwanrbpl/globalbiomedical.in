import {
  CURRENT_COMPANY_ID,
  CURRENT_WEBSITE_ID,
  makeSlug,
  normalizeWebsiteId,
} from "./constants";

const docCache = {};
let catalogCache = null;
let catalogCacheTimestamp = 0;
let catalogInFlightPromise = null;
const CLIENT_CACHE_TTL = 3000;

function getPathParts(path) {
  return String(path || "").split("/").filter(Boolean);
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    cache: "no-store",
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.headers || {}),
    },
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.error || `Request failed with status ${response.status}`);
  }

  return result;
}

export function invalidateCatalogCache() {
  catalogCache = null;
  catalogCacheTimestamp = 0;
  catalogInFlightPromise = null;
}

/**
 * Read website-managed documents through this website's API proxy.
 * The proxy talks to SuperAdmin/SQLite. No Firebase is used here.
 */
export async function fetchDocCached(path, force = false) {
  if (!force && docCache[path]) {
    return docCache[path];
  }

  if (!force && docCache[path + "_promise"]) {
    return docCache[path + "_promise"];
  }

  docCache[path + "_promise"] = (async () => {
    try {
      const parts = getPathParts(path);
      const websiteIndex = parts.indexOf("websites");
      const websiteId =
        websiteIndex >= 0 ? parts[websiteIndex + 1] : CURRENT_WEBSITE_ID;

      const pagesIndex = parts.indexOf("pages");
      const districtsIndex = parts.indexOf("districts");

      let type = "";
      let query = "";

      if (pagesIndex >= 0) {
        type = parts[pagesIndex + 1] || "";
      } else if (districtsIndex >= 0) {
        type = "district";
        query = `&slug=${encodeURIComponent(parts[districtsIndex + 1] || "")}`;
      }

      if (!type) return null;

      const result = await fetchJson(
        `/api/site-data?type=${encodeURIComponent(type)}&websiteId=${encodeURIComponent(
          websiteId
        )}&companyId=${encodeURIComponent(CURRENT_COMPANY_ID)}${query}`
      );

      const data = result?.data ?? null;

      if (data !== null && data !== undefined) {
        docCache[path] = data;
      }

      return data;
    } catch (error) {
      console.error(`[data-fetcher] Error fetching ${path}:`, error);
      delete docCache[path + "_promise"];
      return null;
    } finally {
      delete docCache[path + "_promise"];
    }
  })();

  return docCache[path + "_promise"];
}

export async function fetchFullCatalog({
  forceRefresh = false,
  websiteId = CURRENT_WEBSITE_ID,
  companyId = CURRENT_COMPANY_ID,
} = {}) {
  const now = Date.now();

  if (
    !forceRefresh &&
    catalogCache &&
    now - catalogCacheTimestamp < CLIENT_CACHE_TTL
  ) {
    return catalogCache;
  }

  if (!forceRefresh && catalogInFlightPromise) {
    return catalogInFlightPromise;
  }

  catalogInFlightPromise = (async () => {
    try {
      const result = await fetchJson(
        `/api/catalog?websiteId=${encodeURIComponent(
          normalizeWebsiteId(websiteId)
        )}&companyId=${encodeURIComponent(companyId)}`
      );

      const products = Array.isArray(result?.products) ? result.products : [];

      catalogCache = products;
      catalogCacheTimestamp = Date.now();

      console.log(
        `[data-fetcher] Admin SQLite catalog loaded: ${products.length} products for "${websiteId}"`
      );

      return products;
    } catch (error) {
      console.error("[data-fetcher] Error fetching Admin SQLite catalog:", error);
      return [];
    } finally {
      catalogInFlightPromise = null;
    }
  })();

  return catalogInFlightPromise;
}

export async function fetchProductBySlug(
  slug,
  {
    websiteId = CURRENT_WEBSITE_ID,
    companyId = CURRENT_COMPANY_ID,
    forceRefresh = false,
  } = {}
) {
  if (!slug) return null;

  const catalog = await fetchFullCatalog({
    forceRefresh,
    websiteId,
    companyId,
  });

  const normalizedSlug = makeSlug(slug);

  return (
    catalog.find(
      (product) =>
        product?.slug === slug ||
        makeSlug(product?.slug) === normalizedSlug ||
        makeSlug(product?.title) === normalizedSlug ||
        product?.id === slug ||
        product?.categoryProductId === slug
    ) || null
  );
}

export async function fetchHomeData() {
  return fetchDocCached(`websites/${CURRENT_WEBSITE_ID}/pages/home`);
}

export async function fetchContactData() {
  return fetchDocCached(`websites/${CURRENT_WEBSITE_ID}/pages/contact`);
}

export async function fetchServicesData() {
  return fetchDocCached(`websites/${CURRENT_WEBSITE_ID}/pages/services`);
}

export async function fetchDistrictData(district) {
  if (!district) return null;
  return fetchDocCached(`websites/${CURRENT_WEBSITE_ID}/districts/${district}`);
}

export function extractContactDetails(data) {
  const result = {
    phone: "",
    email: "",
    address: "",
    hours: "",
    phones: [],
    emails: [],
    addresses: [],
    raw: [],
  };

  if (!data) return result;

  let list = [];
  if (Array.isArray(data)) {
    list = data;
  } else if (Array.isArray(data.contactInfo)) {
    list = data.contactInfo;
  }

  result.raw = list;

  for (const item of list) {
    if (!item || !item.label) continue;

    const labelLower = String(item.label)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    const values = Array.isArray(item.value)
      ? item.value.map((value) => String(value || "").trim()).filter(Boolean)
      : typeof item.value === "string" && item.value.trim()
        ? [item.value.trim()]
        : [];

    if (values.length === 0) continue;

    if (
      labelLower.includes("phone") ||
      labelLower.includes("contact") ||
      labelLower.includes("mobile") ||
      labelLower.includes("tel") ||
      labelLower.includes("call") ||
      labelLower.includes("whatsapp")
    ) {
      result.phones.push(...values);
    } else if (labelLower.includes("email") || labelLower.includes("mail")) {
      result.emails.push(...values);
    } else if (
      labelLower.includes("address") ||
      labelLower.includes("location") ||
      labelLower.includes("office") ||
      labelLower.includes("headquarter")
    ) {
      result.addresses.push(...values);
    } else if (
      labelLower.includes("hour") ||
      labelLower.includes("time") ||
      labelLower.includes("timing") ||
      labelLower.includes("schedule")
    ) {
      result.hours = values.join(" | ");
    }
  }

  // Support direct Admin fields without adding static values.
  if (result.phones.length === 0 && data.phone) {
    result.phones.push(String(data.phone));
  }
  if (result.emails.length === 0 && data.email) {
    result.emails.push(String(data.email));
  }
  if (result.addresses.length === 0 && data.address) {
    result.addresses.push(String(data.address));
  }
  if (!result.hours && (data.hours || data.timing || data.workingHours)) {
    result.hours = String(data.hours || data.timing || data.workingHours);
  }

  result.phone = result.phones[0] || "";
  result.email = result.emails[0] || "";
  result.address = result.addresses[0] || "";

  return result;
}
