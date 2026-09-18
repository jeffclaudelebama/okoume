"use client";

import { useState } from "react";
import { useCart } from "@/context/cart-context";
import { formatFcfa } from "@/lib/format";
import type { StorefrontProductDetail } from "@/lib/storefront-catalog";

export function ProductDetail({ product }: { product: StorefrontProductDetail }) {
  const { addItem } = useCart();
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? "");
  const variant = product.variants.find((choice) => choice.id === variantId);
  const available = Boolean(variant && variant.stock > 0);

  return <section className="pt-3"><div className="grid aspect-square place-items-center rounded-3xl bg-[#F5F5F7] dark:bg-[#141414]"><span className="text-6xl font-black tracking-[-0.12em] text-black/10 dark:text-white/10">{product.imageLabel}</span></div><p className="mt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">{product.brand}</p><h1 className="mt-2 text-3xl font-bold tracking-tight">{product.title}</h1><p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-400">{product.description}</p><p className="mt-5 font-mono text-2xl font-bold tabular-nums">{formatFcfa(variant?.price ?? product.price)}</p>{product.previousPrice ? <p className="mt-1 font-mono text-sm tabular-nums text-neutral-500 line-through">{formatFcfa(product.previousPrice)}</p> : null}{product.variants.length > 0 ? <fieldset className="mt-6"><legend className="text-sm font-bold">{product.variants[0].label}</legend><div className="mt-3 space-y-2">{product.variants.map((choice) => <label key={choice.id} className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 ${variantId === choice.id ? "border-black dark:border-white" : "border-[#E5E5E5] dark:border-[#262626]"}`}><span className="text-sm font-medium">{choice.value}</span><span className="text-xs text-neutral-500">{choice.stock} en stock</span><input className="sr-only" type="radio" checked={variantId === choice.id} onChange={() => setVariantId(choice.id)} /></label>)}</div></fieldset> : null}{product.specifications.length > 0 ? <section className="mt-7"><h2 className="text-lg font-bold">Caractéristiques</h2><dl className="mt-3 divide-y divide-[#E5E5E5] rounded-xl border border-[#E5E5E5] px-4 dark:divide-[#262626] dark:border-[#262626]">{product.specifications.map((item) => <div key={item.label} className="flex justify-between gap-4 py-3 text-sm"><dt className="text-neutral-500">{item.label}</dt><dd className="text-right font-medium">{item.value}</dd></div>)}</dl></section> : null}<button type="button" disabled={!available} onClick={() => { if (!variant) return; addItem({ id: variant.id, brand: product.brand, title: `${product.title} — ${variant.value}`, price: variant.price, imageLabel: product.imageLabel }); }} className="mt-7 w-full rounded-xl bg-black py-4 text-sm font-bold text-white disabled:bg-neutral-400 dark:bg-white dark:text-black">{available ? "Ajouter au panier" : "Variante épuisée"}</button></section>;
}
