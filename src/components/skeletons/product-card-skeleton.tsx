export function ProductCardSkeleton() {
  return <article className="overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white p-3 dark:border-[#262626] dark:bg-[#141414]"><div className="okoume-skeleton aspect-square rounded-xl" /><div className="okoume-skeleton mt-4 h-2 w-12 rounded" /><div className="okoume-skeleton mt-2 h-4 w-4/5 rounded" /><div className="mt-4 flex items-end justify-between"><div className="okoume-skeleton h-4 w-20 rounded" /><div className="okoume-skeleton size-10 rounded-xl" /></div></article>;
}
