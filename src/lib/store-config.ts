export const STORE_CONFIG = {
  name: "OKOUMÉ Store",
  domain: "okoumestore.ga",
  currency: "FCFA",
  delivery: { fee: 2000, zoneName: "Grand Libreville & Estuaire (Libreville, Owendo, Akanda)", estimatedTime: "24h à 48h" },
  pickup: { name: "Point Relais OKOUMÉ", location: "Akanda, Delta Postal", landmark: "Repère : OKOUMÉ", fee: 0, availability: "Disponible sous 24h" },
} as const;

export type FulfillmentMethod = "delivery" | "pickup";
