import type { Dictionary } from "@/i18n/dictionaries";

// Solo lo que no cambia con el idioma: el orden y el precio. Título, descripción y
// características están en los diccionarios, en `services.items.<key>`.
// Los precios son "desde" (from), en euros. Revísalos antes de publicar.

export type ServiceKey = keyof Dictionary["services"]["items"];

export const services: { key: ServiceKey; price: number }[] = [
  { key: "tutoring", price: 15 },
  { key: "landing", price: 150 },
  { key: "corporate", price: 400 },
  { key: "blog", price: 300 },
  { key: "ecommerce", price: 800 },
  { key: "custom", price: 1500 },
];
