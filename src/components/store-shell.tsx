"use client";
/* eslint-disable react-hooks/set-state-in-effect -- Theme preference is hydrated once from local storage. */

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { Logo } from "@/components/logo";

const navigation = [["Accueil", "⌂", "/"], ["Rayons", "⊞", "/rayons"], ["Offres", "✦", "/offres"], ["Commandes", "□", "/commandes"], ["Compte", "◯", "/compte"]] as const;

export function StoreShell({ children }: { children: ReactNode }) {
  const { itemCount } = useCart();
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);
  useEffect(() => { const dark = window.localStorage.getItem("okoume-theme") === "dark"; setIsDark(dark); document.documentElement.classList.toggle("dark", dark); }, []);
  function toggleTheme() { const next = !isDark; setIsDark(next); document.documentElement.classList.toggle("dark", next); window.localStorage.setItem("okoume-theme", next ? "dark" : "light"); }
  return <div className="min-h-dvh bg-white text-black dark:bg-[#0A0A0A] dark:text-white">
    <header className="fixed inset-x-0 top-0 z-30 mx-auto flex h-[52px] max-w-2xl items-center justify-between border-b border-[#E5E5E5] bg-white/95 px-4 backdrop-blur dark:border-[#262626] dark:bg-[#0A0A0A]/95"><Logo /><div className="flex items-center gap-1"><button type="button" onClick={toggleTheme} className="grid size-9 place-items-center rounded-full hover:bg-[#F5F5F7] dark:hover:bg-[#141414]" aria-label="Changer le thème"><span className="text-base">{isDark ? "☼" : "◐"}</span></button><Link href="/panier" className="relative grid size-9 place-items-center rounded-full hover:bg-[#F5F5F7] dark:hover:bg-[#141414]" aria-label={`Panier, ${itemCount} article${itemCount > 1 ? "s" : ""}`}><span className="text-lg">▢</span>{itemCount > 0 ? <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-black text-[9px] font-bold text-white dark:bg-white dark:text-black">{itemCount}</span> : null}</Link></div></header>
    <div className="fixed inset-x-0 top-[52px] z-20 mx-auto max-w-2xl border-b border-[#E5E5E5] bg-white/95 px-4 py-2 backdrop-blur dark:border-[#262626] dark:bg-[#0A0A0A]/95"><label className="flex h-10 items-center gap-2 rounded-xl bg-[#F5F5F7] px-3 text-sm text-neutral-500 dark:bg-[#141414] dark:text-neutral-400"><span aria-hidden="true">⌕</span><input className="min-w-0 flex-1 bg-transparent text-black outline-none placeholder:text-neutral-500 dark:text-white" placeholder="Rechercher un produit" aria-label="Rechercher un produit" /></label></div>
    <main className="mx-auto max-w-2xl px-4 pb-24 pt-[116px]">{children}</main>
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto grid h-[66px] max-w-2xl grid-cols-5 border-t border-[#E5E5E5] bg-white/95 px-2 backdrop-blur dark:border-[#262626] dark:bg-[#0A0A0A]/95" aria-label="Navigation principale">{navigation.map(([label, icon, href]) => <Link href={href} key={label} className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium ${pathname === href ? "text-black dark:text-white" : "text-neutral-500 dark:text-neutral-400"}`}><span className="text-lg leading-none" aria-hidden="true">{icon}</span>{label}</Link>)}</nav>
  </div>;
}
