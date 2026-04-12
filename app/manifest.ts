import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Nywele.ai — AI-powered African hair care",
    short_name: "Nywele",
    description:
      "Personalized hair care routines, styling recommendations, and product suggestions for African hair.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#FFFEE1",
    theme_color: "#FFFEE1",
    categories: ["health", "lifestyle"],
    icons: [
      {
        src: "/coil.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/coil.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
