import type { Product, Status } from "./types";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const formatMoney = (n: number): string => money.format(n);

export function getStatus(p: Product): Status {
  if (p.quantity === 0) return { key: "out", label: "Out of stock" };
  if (p.quantity <= p.reorder_level) return { key: "low", label: "Low stock" };
  return { key: "ok", label: "In stock" };
}
