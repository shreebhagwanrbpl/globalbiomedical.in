import { db } from "./firebase";
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import {
  COMPANIES,
  CURRENT_COMPANY_ID,
  CURRENT_WEBSITE_ID,
  isVisibleForWebsite,
  makeSlug,
  normalizeWebsiteId,
} from "./constants";

// In-memory cache for Firestore documents and catalog
const docCache = {};
let catalogCache = null;
let catalogCacheTimestamp = 0;
let catalogInFlightPromise = null;

// Short cache window for single-request deduplication (3 seconds max)
const CLIENT_CACHE_TTL = 3000;

export function invalidateCatalogCache() {
  catalogCache = null;
  catalogCacheTimestamp = 0;
  catalogInFlightPromise = null;
}

/**
 * Fetch a single document and cache its data.
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
      const parts = path.split("/");
      const docRef = doc(db, ...parts);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        docCache[path] = data;
        return data;
      }
      return null;
    } catch (err) {
      console.error(`Error fetching doc at ${path}:`, err);
      delete docCache[path + "_promise"];
      return null;
    }
  })();

  return docCache[path + "_promise"];
}

/**
 * Fetch the full catalog from Master Catalog:
 * companies/{companyId}/categories/{categoryId}/subcategories/{subcategoryId}
 * 
 * Applies bulletproof visibility and instant unassign/hide logic:
 * - Category hidden -> subcategories & products hidden
 * - Subcategory hidden -> products hidden
 * - Product hidden / empty websiteIds -> product hidden
 */
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
    const startTime = performance.now();
    const targetWebsite = normalizeWebsiteId(websiteId);

    try {
      const allProducts = [];
      const seenIds = new Set();

      // Order companies: primary detected company first, followed by others
      const targetCompanies = [
        companyId,
        ...COMPANIES.filter((c) => c !== companyId),
      ];

      await Promise.all(
        targetCompanies.map(async (comp) => {
          try {
            const catCol = collection(db, "companies", comp, "categories");
            const catSnap = await getDocs(catCol);

            await Promise.all(
              catSnap.docs.map(async (categoryDoc) => {
                const catData = categoryDoc.data() || {};
                const catName = catData.name || catData.category || categoryDoc.id;

                // 1. Category Visibility Check (If hidden, skip all nested contents)
                if (!isVisibleForWebsite(catData, targetWebsite)) {
                  return;
                }

                try {
                  const subCol = collection(
                    db,
                    "companies",
                    comp,
                    "categories",
                    categoryDoc.id,
                    "subcategories"
                  );
                  const subSnap = await getDocs(subCol);

                  for (const subDoc of subSnap.docs) {
                    const subData = subDoc.data() || {};
                    const subName = subData.name || subData.subCategory || subDoc.id;

                    // 2. Subcategory Visibility Check (If hidden, skip products)
                    if (!isVisibleForWebsite(subData, targetWebsite)) {
                      continue;
                    }

                    const rawProducts = Array.isArray(subData.products)
                      ? subData.products
                      : [];

                    for (let idx = 0; idx < rawProducts.length; idx++) {
                      const prod = rawProducts[idx];
                      if (!prod) continue;

                      // 3. Product Visibility Check
                      if (!isVisibleForWebsite(prod, targetWebsite)) {
                        continue;
                      }

                      const prodId =
                        prod.id ||
                        prod.categoryProductId ||
                        `${comp}-${categoryDoc.id}-${subDoc.id}-${idx}`;

                      if (seenIds.has(prodId)) continue;
                      seenIds.add(prodId);

                      const title = prod.title || prod.name || "Untitled Product";
                      const slug = prod.slug || makeSlug(title);
                      const images = Array.isArray(prod.images)
                        ? prod.images.filter(Boolean)
                        : prod.image
                        ? [prod.image]
                        : [];

                      allProducts.push({
                        ...prod,
                        uid: `${categoryDoc.id}-${subDoc.id}-${idx}`,
                        id: prodId,
                        categoryProductId: prod.categoryProductId || prod.id || "",
                        title,
                        name: title,
                        slug,
                        price: prod.price || "",
                        desc: prod.desc || prod.description || "",
                        description: prod.description || prod.desc || "",
                        brand: prod.brand || "",
                        model: prod.model || "",
                        capacity: prod.capacity || "",
                        throughput: prod.throughput || "",
                        instrument: prod.instrument || "",
                        usage: prod.usage || "",
                        parameters: prod.parameters || "",
                        automation: prod.automation || "",
                        availability: prod.availability || "",
                        size: prod.size || "",
                        category: catName,
                        categoryId: categoryDoc.id,
                        subCategory: subName,
                        subcategoryId: subDoc.id,
                        companyId: comp,
                        images,
                        image: images[0] || "",
                        video: prod.video || "",
                        pdf: prod.pdf || "",
                        isPublished: prod.isPublished !== false,
                        websiteIds: prod.websiteIds || [],
                      });
                    }
                  }

                  // Direct category products (if any)
                  if (Array.isArray(catData.products)) {
                    for (let idx = 0; idx < catData.products.length; idx++) {
                      const prod = catData.products[idx];
                      if (!prod) continue;
                      if (!isVisibleForWebsite(prod, targetWebsite)) continue;

                      const prodId =
                        prod.id ||
                        prod.categoryProductId ||
                        `${comp}-${categoryDoc.id}-direct-${idx}`;

                      if (seenIds.has(prodId)) continue;
                      seenIds.add(prodId);

                      const title = prod.title || prod.name || "Untitled Product";
                      const slug = prod.slug || makeSlug(title);
                      const images = Array.isArray(prod.images)
                        ? prod.images.filter(Boolean)
                        : prod.image
                        ? [prod.image]
                        : [];

                      allProducts.push({
                        ...prod,
                        uid: `${categoryDoc.id}-direct-${idx}`,
                        id: prodId,
                        categoryProductId: prod.categoryProductId || prod.id || "",
                        title,
                        name: title,
                        slug,
                        price: prod.price || "",
                        desc: prod.desc || prod.description || "",
                        description: prod.description || prod.desc || "",
                        brand: prod.brand || "",
                        model: prod.model || "",
                        category: catName,
                        categoryId: categoryDoc.id,
                        subCategory: prod.subCategory || catName,
                        subcategoryId: prod.subcategoryId || categoryDoc.id,
                        companyId: comp,
                        images,
                        image: images[0] || "",
                        video: prod.video || "",
                        pdf: prod.pdf || "",
                        isPublished: prod.isPublished !== false,
                        websiteIds: prod.websiteIds || [],
                      });
                    }
                  }
                } catch (subErr) {
                  console.error(
                    `Error fetching subcategories for category ${categoryDoc.id} in ${comp}:`,
                    subErr
                  );
                }
              })
            );
          } catch (compErr) {
            console.error(`Error fetching categories for company ${comp}:`, compErr);
          }
        })
      );

      const duration = performance.now() - startTime;
      console.log(
        `[data-fetcher] Master Catalog fetch completed: ${allProducts.length} items visible for "${targetWebsite}" in ${duration.toFixed(
          2
        )}ms`
      );

      catalogCache = allProducts;
      catalogCacheTimestamp = Date.now();
      return allProducts;
    } catch (err) {
      console.error("[data-fetcher] Error fetching master catalog:", err);
      return [];
    } finally {
      catalogInFlightPromise = null;
    }
  })();

  return catalogInFlightPromise;
}

/**
 * Fetch a single product by its URL slug from the Master Catalog.
 */
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
      (p) =>
        p.slug === slug ||
        makeSlug(p.slug) === normalizedSlug ||
        makeSlug(p.title) === normalizedSlug ||
        p.id === slug ||
        p.categoryProductId === slug
    ) || null
  );
}

/**
 * Helpers for cached document retrieval across pages
 */
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

/**
 * Universal contact details extractor that handles any label variant
 * (Phone, Contact, Mobile, Email, Address, Office Address, etc.)
 */
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

    let values = [];
    if (Array.isArray(item.value)) {
      values = item.value
        .map((v) => String(v || "").trim())
        .filter(Boolean);
    } else if (typeof item.value === "string" && item.value.trim()) {
      values = [item.value.trim()];
    }

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

  // Fallbacks for direct properties
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
