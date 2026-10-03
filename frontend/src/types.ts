export interface ProductInput {
  name: string;
  sku: string;
  category: string;
  price: number;
  quantity: number;
  reorder_level: number;
}

export interface Product extends ProductInput {
  id: number;
}

export interface Stats {
  total_products: number;
  total_units: number;
  inventory_value: number;
  low_stock: number;
  out_of_stock: number;
}

export type StatusKey = "ok" | "low" | "out";

export interface Status {
  key: StatusKey;
  label: string;
}

export interface Filters {
  query: string;
  category: string;
  status: "all" | StatusKey;
}
