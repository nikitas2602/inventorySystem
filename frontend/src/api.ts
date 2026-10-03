import type { Product, ProductInput, Stats } from "./types";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body: { detail?: string | { msg: string }[] } = await res.json().catch(() => ({}));
    const detail = body.detail;
    throw new Error(
      typeof detail === "string" ? detail : detail?.[0]?.msg || "Something went wrong"
    );
  }
  return (res.status === 204 ? null : await res.json()) as T;
}

export const api = {
  list: () => request<Product[]>("/products"),
  stats: () => request<Stats>("/stats"),
  create: (data: ProductInput) =>
    request<Product>("/products", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: ProductInput) =>
    request<Product>(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id: number) => request<null>(`/products/${id}`, { method: "DELETE" }),
  adjust: (id: number, delta: number) =>
    request<Product>(`/products/${id}/stock`, { method: "PATCH", body: JSON.stringify({ delta }) }),
};
