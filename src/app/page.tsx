import { ProductCard } from "@/components/product-card";
import { formatFcfa } from "@/lib/format";
import { STORE_CONFIG } from "@/lib/store-config";
import { getStorefrontProducts } from "@/lib/storefront-catalog";

export const dynamic = "force-dynamic";


export default async function Home() {
  const products = await getStorefrontProducts();
  return <>
    <section className="rounded-2xl bg-black p-5 text-white dark:bg-white dark:text-black">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-65">Ventes Flash</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">La technologie, sans attente.</h1>
      <div className="mt-5 flex items-end justify-between"><div><p className="text-xs opacity-70">Fin de l&apos;offre dans</p><p className="mt-1 font-mono text-2xl font-bold tabular-nums">04:28:17</p></div><span className="rounded-full border border-white/30 px-3 py-1.5 text-xs font-semibold dark:border-black/25">Voir les offres</span></div>
    </section>
    <section className="mt-7"><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold tracking-tight">En ce moment</h2><button className="okoume-interactive text-xs font-semibold underline underline-offset-4">Tout voir</button></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.id} {...product} />)}</div></section>
    <section className="mt-7 rounded-2xl border border-[#E5E5E5] bg-[#F5F5F7] p-4 dark:border-[#262626] dark:bg-[#141414]"><p className="text-xs font-bold">Livraison ou retrait, à votre rythme.</p><p className="mt-1 text-xs leading-5 text-neutral-600 dark:text-neutral-400">Livraison {STORE_CONFIG.delivery.zoneName} : {formatFcfa(STORE_CONFIG.delivery.fee)} · {STORE_CONFIG.delivery.estimatedTime}. Retrait gratuit à {STORE_CONFIG.pickup.location}.</p></section>
  </>;
}
