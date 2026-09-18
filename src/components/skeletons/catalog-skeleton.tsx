import { ProductCardSkeleton } from "@/components/skeletons/product-card-skeleton";

export function CatalogSkeleton() {
  return <section className="pt-3"><div className="okoume-skeleton h-2 w-16 rounded" /><div className="okoume-skeleton mt-3 h-9 w-28 rounded" /><div className="mt-5 flex gap-2">{Array.from({ length: 4 }, (_, index) => <div key={index} className="okoume-skeleton h-9 w-20 shrink-0 rounded-full" />)}</div><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 6 }, (_, index) => <ProductCardSkeleton key={index} />)}</div></section>;
}
