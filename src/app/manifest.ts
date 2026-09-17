import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest { return { name: "OKOUMÉ Store", short_name: "OKOUMÉ", description: "High-tech, smartphones et électronique au Gabon.", start_url: "/", display: "standalone", background_color: "#FFFFFF", theme_color: "#000000", icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }] }; }
