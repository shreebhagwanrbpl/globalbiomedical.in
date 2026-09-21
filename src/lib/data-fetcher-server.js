import { fetchFullCatalog as fetchFullCatalogRaw } from "./data-fetcher";
import { cache } from "react";

// Server memory cache (short TTL of 3 seconds to prevent stale visibility locks)
let cachedCatalog = null;
let cachedCatalogTimestamp = 0;
const CACHE_TTL = 3000; // 3 seconds

async function getCachedCatalog() {
  const now = Date.now();
  if (cachedCatalog && now - cachedCatalogTimestamp < CACHE_TTL) {
    return cachedCatalog;
  }

  const data = await fetchFullCatalogRaw({ forceRefresh: true });
  cachedCatalog = data;
  cachedCatalogTimestamp = now;
  return data;
}

export const fetchFullCatalog = cache(async () => {
  const start = performance.now();
  const products = await getCachedCatalog();
  const end = performance.now();
  console.log(
    `[data-fetcher-server] fetchFullCatalog returned ${products.length} products in ${(
      end - start
    ).toFixed(2)}ms`
  );
  return products;
});
