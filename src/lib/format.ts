import { STORE_CONFIG } from "@/lib/store-config";

export function formatFcfa(amount: number) {
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(amount)} ${STORE_CONFIG.currency}`;
}
