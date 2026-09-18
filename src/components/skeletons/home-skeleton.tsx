import { ProductCardSkeleton } from "@/components/skeletons/product-card-skeleton";

export function HomeSkeleton() {
  return <><section className="rounded-2xl bg-black p-5"><div className="h-2 w-20 rounded bg-white/20" /><div className="mt-3 h-7 w-3/4 rounded bg-white/20" /><div className="mt-7 h-6 w-28 rounded bg-white/20" /></section><section className="mt-7"><div className="okoume-skeleton h-5 w-32 rounded" /><div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <ProductCardSkeleton key={index} />)}</div></section></>;
}
