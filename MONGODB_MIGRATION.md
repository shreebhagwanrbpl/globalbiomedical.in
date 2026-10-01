# MongoDB-backed Admin API migration

This website no longer uses Firebase SDKs or a SQLite database. Catalog and page data are requested from the SuperAdmin API, which reads MongoDB. Contact and product enquiries are POSTed to `/api/public-query` on the Admin server and stored under `websitesQueries/{websiteId}/contactQueries` or `productQueries`.

## Website environment
Set these on the website host (server/runtime environment):

```env
ADMIN_API_BASE_URL=https://admin.rajbiosis.app
NEXT_PUBLIC_WEBSITE_ID=globalbiomedicalin
NEXT_PUBLIC_COMPANY_ID=global
```

Use the actual public Admin API URL if it differs. Do not put MongoDB credentials in this website project.

## Admin environment
The Admin server must have `MONGODB_URI` and `MONGODB_DB=company_master_cms` set in its hosting environment. The URI is intentionally not stored in source code. Configure the real MongoDB Atlas URI as a secret in the Admin host.

Note: `next.config.js` retains the Firebase Storage hostname only to keep already-saved product image URLs rendering if legacy records still reference it; the website does not initialize Firebase or use Firebase for database reads/writes. Migrate those image URLs to your preferred storage provider if you want to remove that last legacy asset reference.
