import Link from "next/link";

export function SectionPage({ title, description, action }: { title: string; description: string; action?: string }) {
  return <section className="pt-3"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">OKOUMÉ Store</p><h1 className="mt-2 text-3xl font-bold tracking-tight">{title}</h1><p className="mt-3 max-w-md text-sm leading-6 text-neutral-600 dark:text-neutral-400">{description}</p><div className="mt-8 rounded-2xl border border-[#E5E5E5] bg-[#F5F5F7] p-5 dark:border-[#262626] dark:bg-[#141414]"><p className="font-semibold">Bientôt disponible</p><p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Cette section sera reliée aux données réelles pendant la phase catalogue et commandes.</p>{action ? <Link href="/rayons" className="mt-5 inline-flex rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white dark:bg-white dark:text-black">{action}</Link> : null}</div></section>;
}
