"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { formatFcfa } from "@/lib/format";
import { STORE_CONFIG } from "@/lib/store-config";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const inputClass = "mt-1 w-full rounded-xl border border-[#E5E5E5] bg-white px-3 py-3 text-sm outline-none focus:border-black dark:border-[#262626] dark:bg-[#141414] dark:focus:border-white";

export default function CheckoutPage() {
  const { items, total, fulfillmentMethod, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    void supabase.auth.getUser().then(({ data }) => {
      setIsAuthenticated(Boolean(data.user));
      setIsCheckingSession(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session?.user));
      setIsCheckingSession(false);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (reference) {
    return <section className="pt-3"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">Commande confirmée</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Merci pour votre commande.</h1><p className="mt-4 text-sm leading-6 text-neutral-600 dark:text-neutral-400">Votre référence est <strong className="font-mono text-black dark:text-white">{reference}</strong>. Notre équipe vous contactera sur WhatsApp pour confirmation.</p><Link href="/commandes" className="mt-7 inline-flex rounded-xl bg-black px-5 py-3 text-sm font-bold text-white dark:bg-white dark:text-black">Suivre ma commande</Link></section>;
  }

  if (!items.length) return <section className="pt-3"><h1 className="text-3xl font-bold">Commande express</h1><p className="mt-3 text-sm text-neutral-500">Ajoute un produit avant de commencer.</p></section>;
  if (isCheckingSession) return <section className="pt-3"><p className="text-sm text-neutral-500">Vérification de votre compte…</p></section>;
  if (!isAuthenticated) return <section className="pt-3"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">Compte requis</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Connectez-vous pour commander.</h1><p className="mt-4 text-sm leading-6 text-neutral-600 dark:text-neutral-400">Aucun achat ne peut être enregistré sans un compte client actif.</p><Link href="/compte" className="mt-7 inline-flex rounded-xl bg-black px-5 py-3 text-sm font-bold text-white dark:bg-white dark:text-black">Créer un compte ou se connecter</Link></section>;

  function next(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setWhatsappPhone(String(formData.get("phone") ?? "").trim());
    setStep(2);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const payment = String(formData.get("payment"));
    const paymentMethod = payment === "airtel" ? "airtel_money" : payment === "moov" ? "moov_money" : "cash_on_delivery";
    const { data, error: rpcError } = await createBrowserSupabaseClient().rpc("create_customer_order", {
      p_whatsapp_phone: whatsappPhone,
      p_city: String(formData.get("city")),
      p_district: fulfillmentMethod === "delivery" ? String(formData.get("district") ?? "") : "",
      p_landmark: fulfillmentMethod === "delivery" ? String(formData.get("landmark") ?? "") : "",
      p_fulfillment: fulfillmentMethod,
      p_payment_method: paymentMethod,
      p_items: items.map((item) => ({ variant_id: item.id, quantity: item.quantity })),
    });
    setIsSubmitting(false);

    if (rpcError || !data?.[0]?.reference) {
      setError(rpcError?.message ?? "La commande n’a pas pu être enregistrée. Réessaie dans un instant.");
      return;
    }

    clearCart();
    setReference(data[0].reference);
  }

  return <section className="pt-3"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">Commande express · étape {step}/2</p><h1 className="mt-2 text-3xl font-bold tracking-tight">{step === 1 ? "Votre WhatsApp" : "Livraison et paiement"}</h1>{step === 1 ? <form onSubmit={next} className="mt-6 space-y-4"><label className="block text-sm font-semibold">Numéro WhatsApp<input required className={inputClass} name="phone" inputMode="tel" autoComplete="tel" defaultValue={whatsappPhone} placeholder="Ex. 06 00 00 00" /></label><p className="rounded-xl bg-[#F5F5F7] p-3 text-xs leading-5 text-neutral-600 dark:bg-[#141414] dark:text-neutral-400">Ce numéro est rattaché à votre compte pour confirmer et suivre votre commande.</p><button className="w-full rounded-xl bg-black py-4 text-sm font-bold text-white dark:bg-white dark:text-black">Continuer</button></form> : <form onSubmit={submit} className="mt-6 space-y-4"><label className="block text-sm font-semibold">Ville<select required className={inputClass} name="city" defaultValue=""><option value="" disabled>Choisir une ville</option><option>Libreville</option><option>Akanda</option><option>Owendo</option></select></label>{fulfillmentMethod === "delivery" ? <><label className="block text-sm font-semibold">Quartier<input required className={inputClass} name="district" placeholder="Ex. Louis" /></label><label className="block text-sm font-semibold">Précision de repérage<textarea required className={inputClass} name="landmark" rows={3} placeholder="Rue, bâtiment, repère visible..." /></label></> : <p className="rounded-xl bg-[#F5F5F7] p-3 text-sm dark:bg-[#141414]">Retrait : {STORE_CONFIG.pickup.location} · {STORE_CONFIG.pickup.landmark}</p>}<fieldset><legend className="text-sm font-semibold">Paiement</legend><div className="mt-2 space-y-2"><label className="flex rounded-xl border border-[#E5E5E5] p-3 text-sm dark:border-[#262626]"><input defaultChecked type="radio" name="payment" value="cash" className="mr-3" />Paiement à la livraison</label><label className="flex rounded-xl border border-[#E5E5E5] p-3 text-sm dark:border-[#262626]"><input type="radio" name="payment" value="airtel" className="mr-3" />Airtel Money</label><label className="flex rounded-xl border border-[#E5E5E5] p-3 text-sm dark:border-[#262626]"><input type="radio" name="payment" value="moov" className="mr-3" />Moov Money</label></div></fieldset><div className="rounded-xl bg-black p-4 text-white dark:bg-white dark:text-black"><span className="text-sm">Total à régler</span><p className="mt-1 font-mono text-xl font-bold tabular-nums">{formatFcfa(total)}</p></div>{error ? <p role="alert" className="rounded-xl border border-black p-3 text-sm dark:border-white">{error}</p> : null}<button disabled={isSubmitting} className="w-full rounded-xl bg-black py-4 text-sm font-bold text-white disabled:bg-neutral-400 dark:bg-white dark:text-black">{isSubmitting ? "Enregistrement…" : "Confirmer la demande"}</button></form>}</section>;
}
