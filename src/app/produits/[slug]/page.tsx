import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product-detail";
import { getStorefrontProduct } from "@/lib/storefront-catalog";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getStorefrontProduct(slug);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
