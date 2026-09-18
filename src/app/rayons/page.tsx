import { CatalogBrowser } from "@/components/catalog-browser";
import { getStorefrontProducts } from "@/lib/storefront-catalog";

export const dynamic = "force-dynamic";

export default async function Page() {
  return <CatalogBrowser products={await getStorefrontProducts()} />;
}
