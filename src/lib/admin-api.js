import { CURRENT_COMPANY_ID, CURRENT_WEBSITE_ID } from "./constants";

const DEFAULT_ADMIN_API_URL = "https://admin.rajbiosis.app";

function getServerAdminApiUrl() {
  return (
    process.env.ADMIN_API_BASE_URL ||
    process.env.ADMIN_API_URL ||
    process.env.SQLITE_ADMIN_API_URL ||
    DEFAULT_ADMIN_API_URL
  ).replace(/\/$/, "");
}

export async function fetchAdminJson(path, options = {}) {
  const query = new URLSearchParams(options.query || {});

  if (!query.has("websiteId")) query.set("websiteId", CURRENT_WEBSITE_ID);
  if (!query.has("companyId")) query.set("companyId", CURRENT_COMPANY_ID);

  const isBrowser = typeof window !== "undefined";
  const base = isBrowser ? "/api" : getServerAdminApiUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const separator = cleanPath.includes("?") ? "&" : "?";
  const url = `${base}${cleanPath}${query.toString() ? separator + query.toString() : ""}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      json?.error || `Admin API request failed with status ${response.status}`
    );
  }

  return json;
}

export function adminApiContext() {
  return {
    websiteId: CURRENT_WEBSITE_ID,
    companyId: CURRENT_COMPANY_ID,
  };
}
