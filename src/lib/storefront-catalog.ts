import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export type StorefrontProduct = {
  id: string;
  slug: string;
  brand: string;
  title: string;
  description: string;
  price: number;
  previousPrice?: number;
  stock: number;
  imageLabel: string;
  category: string;
  defaultVariantId?: string;
  defaultVariantValue?: string;
  defaultVariantPrice?: number;
};

export type StorefrontProductVariant = {
  id: string;
  productId: string;
  sku: string;
  label: string;
  value: string;
  price: number;
  stock: number;
};

export type StorefrontProductDetail = StorefrontProduct & {
  variants: StorefrontProductVariant[];
  specifications: { label: string; value: string; sortOrder: number }[];
};

type CatalogRow = {
  id: string;
  slug: string;
  brand: string;
  title: string;
  description: string;
  price_xaf: number;
  previous_price_xaf: number | null;
  stock: number;
  category_slug: string;
};

type CatalogVariantRow = {
  id: string;
  product_id: string;
  sku: string;
  label: string;
  value: string;
  price_xaf: number;
  stock: number;
};

type SpecificationRow = { label: string; value: string; sort_order: number };

function toStorefrontProduct(product: CatalogRow): StorefrontProduct {
  return {
    id: product.id,
    slug: product.slug,
    brand: product.brand,
    title: product.title,
    description: product.description,
    price: product.price_xaf,
    previousPrice: product.previous_price_xaf ?? undefined,
    stock: product.stock,
    imageLabel: product.brand.toUpperCase().slice(0, 8),
    category: product.category_slug,
  };
}

export async function getStorefrontProducts(): Promise<StorefrontProduct[]> {
  const supabase = createBrowserSupabaseClient();
  const [productsResult, variantsResult] = await Promise.all([
    supabase.from("public_catalog_products").select("*").order("title"),
    supabase
      .from("public_catalog_variants")
      .select("id, product_id, value, price_xaf, stock")
      .order("value"),
  ]);

  if (productsResult.error || variantsResult.error) {
    throw new Error("Impossible de charger le catalogue.");
  }

  const variants = variantsResult.data as Pick<
    CatalogVariantRow,
    "id" | "product_id" | "value" | "price_xaf" | "stock"
  >[];

  return (productsResult.data as CatalogRow[]).map((product) => {
    const variant =
      variants.find(
        (candidate) => candidate.product_id === product.id && candidate.stock > 0,
      ) ?? variants.find((candidate) => candidate.product_id === product.id);

    return {
      ...toStorefrontProduct(product),
      defaultVariantId: variant?.id,
      defaultVariantValue: variant?.value,
      defaultVariantPrice: variant?.price_xaf ?? product.price_xaf,
    };
  });
}

export async function getStorefrontProduct(
  slug: string,
): Promise<StorefrontProductDetail | null> {
  const supabase = createBrowserSupabaseClient();
  const { data: product, error: productError } = await supabase
    .from("public_catalog_products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (productError) throw new Error("Impossible de charger ce produit.");
  if (!product) return null;

  const [variantsResult, specificationsResult] = await Promise.all([
    supabase
      .from("public_catalog_variants")
      .select("id, product_id, sku, label, value, price_xaf, stock")
      .eq("product_id", product.id)
      .order("value"),
    supabase
      .from("product_specifications")
      .select("label, value, sort_order")
      .eq("product_id", product.id)
      .order("sort_order"),
  ]);

  if (variantsResult.error || specificationsResult.error) {
    throw new Error("Impossible de charger les détails de ce produit.");
  }

  return {
    ...toStorefrontProduct(product as CatalogRow),
    variants: (variantsResult.data as CatalogVariantRow[]).map((variant) => ({
      id: variant.id,
      productId: variant.product_id,
      sku: variant.sku,
      label: variant.label,
      value: variant.value,
      price: variant.price_xaf,
      stock: variant.stock,
    })),
    specifications: (specificationsResult.data as SpecificationRow[]).map(
      (specification) => ({
        label: specification.label,
        value: specification.value,
        sortOrder: specification.sort_order,
      }),
    ),
  };
}
