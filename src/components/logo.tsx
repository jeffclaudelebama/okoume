import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex h-9 items-center" aria-label="OKOUMÉ Store — Accueil">
      <Image src="/brand/okoume-logo-black.png" alt="OKOUMÉ" width={154} height={60} priority className="h-8 w-auto object-contain dark:hidden" />
      <Image src="/brand/okoume-logo-white.png" alt="" width={154} height={60} priority className="hidden h-8 w-auto object-contain dark:block" />
    </Link>
  );
}
