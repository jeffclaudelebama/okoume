"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const inputClass = "mt-1 w-full rounded-xl border border-[#E5E5E5] bg-white px-3 py-3 text-sm outline-none focus:border-black dark:border-[#262626] dark:bg-[#141414] dark:focus:border-white";
type Mode = "signin" | "signup";

export default function AccountPage() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setEmail(session?.user.email ?? null));
    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage(null); setError(null); setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const formEmail = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    if (mode === "signup") {
      const fullName = String(formData.get("full_name") ?? "").trim();
      if (fullName.length < 2 || password.length < 8) { setError("Indique un nom et un mot de passe d’au moins 8 caractères."); setIsSubmitting(false); return; }
      const { data, error: authError } = await supabase.auth.signUp({ email: formEmail, password, options: { data: { full_name: fullName }, emailRedirectTo: `${window.location.origin}/compte` } });
      setIsSubmitting(false);
      if (authError) { setError(authError.message); return; }
      if (!data.session) setMessage("Compte créé. Vérifie maintenant ton e-mail pour l’activer, puis connecte-toi.");
      return;
    }
    const { error: authError } = await supabase.auth.signInWithPassword({ email: formEmail, password });
    setIsSubmitting(false);
    if (authError) { setError("E-mail ou mot de passe incorrect."); return; }
    setMessage("Connexion réussie. Tu peux maintenant finaliser ta commande.");
  }

  if (email) return <section className="pt-3"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">Compte actif</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Bonjour</h1><p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">Connecté avec {email}. Les achats sont associés à ce compte.</p><button type="button" onClick={() => void supabase.auth.signOut()} className="okoume-interactive mt-7 rounded-xl border border-[#E5E5E5] px-5 py-3 text-sm font-bold dark:border-[#262626]">Se déconnecter</button></section>;

  return <section className="pt-3"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">OKOUMÉ Store</p><h1 className="mt-2 text-3xl font-bold tracking-tight">{mode === "signin" ? "Connexion" : "Créer un compte"}</h1><p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-400">Un compte actif est obligatoire pour passer commande et suivre ses achats.</p><div className="mt-6 grid grid-cols-2 rounded-xl bg-[#F5F5F7] p-1 dark:bg-[#141414]"><button type="button" onClick={() => { setMode("signin"); setError(null); setMessage(null); }} className={`okoume-interactive rounded-lg py-2 text-sm font-bold ${mode === "signin" ? "bg-white dark:bg-black" : "text-neutral-500"}`}>Connexion</button><button type="button" onClick={() => { setMode("signup"); setError(null); setMessage(null); }} className={`okoume-interactive rounded-lg py-2 text-sm font-bold ${mode === "signup" ? "bg-white dark:bg-black" : "text-neutral-500"}`}>Créer un compte</button></div><form onSubmit={submit} className="mt-6 space-y-4">{mode === "signup" ? <label className="block text-sm font-semibold">Nom complet<input required name="full_name" autoComplete="name" className={inputClass} placeholder="Votre nom" /></label> : null}<label className="block text-sm font-semibold">E-mail<input required type="email" name="email" autoComplete="email" className={inputClass} placeholder="vous@exemple.com" /></label><label className="block text-sm font-semibold">Mot de passe<input required type="password" name="password" minLength={8} autoComplete={mode === "signin" ? "current-password" : "new-password"} className={inputClass} placeholder="Au moins 8 caractères" /></label>{error ? <p role="alert" className="rounded-xl border border-black p-3 text-sm dark:border-white">{error}</p> : null}{message ? <p className="rounded-xl bg-[#F5F5F7] p-3 text-sm dark:bg-[#141414]">{message}</p> : null}<button disabled={isSubmitting} className="okoume-interactive w-full rounded-xl bg-black py-4 text-sm font-bold text-white disabled:bg-neutral-400 dark:bg-white dark:text-black">{isSubmitting ? "Patiente…" : mode === "signin" ? "Se connecter" : "Créer mon compte"}</button></form></section>;
}
