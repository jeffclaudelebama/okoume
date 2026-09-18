export type ProductVariant = { id: string; label: string; value: string; stock: number };
export type CatalogProduct = { id: string; slug: string; brand: string; title: string; price: number; previousPrice?: number; stock: number; imageLabel: string; category: "smartphones" | "accessoires" | "audio" | "electromenager"; description: string; specifications: { label: string; value: string }[]; variants: ProductVariant[] };

export const categories = [
  { id: "smartphones", label: "Smartphones" }, { id: "accessoires", label: "Accessoires" }, { id: "audio", label: "Audio" }, { id: "electromenager", label: "Maison" },
] as const;

export const products: CatalogProduct[] = [
  { id: "iphone-16", slug: "iphone-16-pro-256", brand: "Apple", title: "iPhone 16 Pro 256 Go", price: 875000, previousPrice: 925000, stock: 3, imageLabel: "16 PRO", category: "smartphones", description: "Le modèle Pro conçu pour les performances et la photo.", variants: [{ id: "natural", label: "Coloris", value: "Titane naturel · 256 Go", stock: 2 }, { id: "black", label: "Coloris", value: "Titane noir · 256 Go", stock: 1 }], specifications: [{ label: "Écran", value: "6,3 pouces" }, { label: "Stockage", value: "256 Go" }, { label: "Réseau", value: "5G" }] },
  { id: "buds-3", slug: "galaxy-buds-3-pro", brand: "Samsung", title: "Galaxy Buds3 Pro", price: 145000, stock: 12, imageLabel: "BUDS", category: "audio", description: "Écouteurs sans fil à réduction active du bruit.", variants: [{ id: "silver", label: "Coloris", value: "Argent", stock: 7 }, { id: "white", label: "Coloris", value: "Blanc", stock: 5 }], specifications: [{ label: "Connexion", value: "Bluetooth" }, { label: "Garantie", value: "12 mois" }] },
  { id: "tecno-camon", slug: "tecno-camon-30-premier", brand: "TECNO", title: "Camon 30 Premier 5G", price: 299000, stock: 5, imageLabel: "CAMON", category: "smartphones", description: "Smartphone 5G pour la photographie mobile.", variants: [{ id: "black", label: "Coloris", value: "Noir · 512 Go", stock: 3 }, { id: "gold", label: "Coloris", value: "Or · 512 Go", stock: 2 }], specifications: [{ label: "Réseau", value: "5G" }, { label: "Stockage", value: "512 Go" }] },
  { id: "anker-20k", slug: "anker-powerbank-20000", brand: "Anker", title: "Powerbank 20 000 mAh", price: 35000, stock: 18, imageLabel: "20K", category: "accessoires", description: "Batterie externe haute capacité.", variants: [{ id: "black", label: "Coloris", value: "Noir", stock: 18 }], specifications: [{ label: "Capacité", value: "20 000 mAh" }, { label: "Ports", value: "USB-C + USB-A" }] },
];

export function findProduct(slug: string) { return products.find((product) => product.slug === slug); }
