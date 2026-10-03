import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { api } from "./api";
import { getStatus } from "./utils";
import type { Filters, Product, ProductInput, Stats } from "./types";
import StatsBar from "./components/StatsBar";
import Toolbar from "./components/Toolbar";
import ProductTable from "./components/ProductTable";
import ProductDrawer from "./components/ProductDrawer";

interface DrawerState {
  open: boolean;
  product: Product | null;
}

const DEFAULT_FILTERS: Filters = { query: "", category: "All", status: "all" };

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [drawer, setDrawer] = useState<DrawerState>({ open: false, product: null });
  const [toast, setToast] = useState("");

  const load = useCallback(async () => {
    try {
      const [p, s] = await Promise.all([api.list(), api.stats()]);
      setProducts(p);
      setStats(s);
      setError("");
    } catch {
      setError("Can't reach the server. Start the API on port 8000, then refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const notify = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 2400);
  };

  const categories = useMemo<[string, number][]>(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => (counts[p.category] = (counts[p.category] || 0) + 1));
    return Object.entries(counts).sort(([a], [b]) => a.localeCompare(b));
  }, [products]);

  const visible = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return products.filter((p) => {
      const matchesText = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      const matchesCategory = filters.category === "All" || p.category === filters.category;
      const matchesStatus = filters.status === "all" || getStatus(p).key === filters.status;
      return matchesText && matchesCategory && matchesStatus;
    });
  }, [products, filters]);

  const closeDrawer = () => setDrawer({ open: false, product: null });

  const handleSave = async (data: ProductInput, id?: number) => {
    if (id) await api.update(id, data);
    else await api.create(data);
    await load();
    closeDrawer();
    notify(id ? "Product updated" : "Product added");
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Delete "${product.name}"? This can't be undone.`)) return;
    try {
      await api.remove(product.id);
      await load();
      notify("Product deleted");
    } catch (e) {
      notify(e instanceof Error ? e.message : "Could not delete product");
    }
  };

  const handleAdjust = async (product: Product, delta: number) => {
    try {
      await api.adjust(product.id, delta);
      await load();
    } catch (e) {
      notify(e instanceof Error ? e.message : "Could not update stock");
    }
  };

  return (
    <>
      <header className="hero">
        <div className="wrap">
          <div className="hero-top">
            <div>
              <h1>Shelfwise</h1>
              <p>Everything on your shelves, and what to reorder next.</p>
            </div>
            <button className="btn btn-light" onClick={() => setDrawer({ open: true, product: null })}>
              <Plus size={18} /> Add product
            </button>
          </div>
          <StatsBar stats={stats} />
        </div>
      </header>

      <main className="wrap">
        <section className="panel">
          <Toolbar filters={filters} setFilters={setFilters} categories={categories} total={products.length} />
          {error ? (
            <div className="notice">{error}</div>
          ) : loading ? (
            <div className="notice">Loading inventory…</div>
          ) : (
            <ProductTable
              products={visible}
              hasProducts={products.length > 0}
              onEdit={(product) => setDrawer({ open: true, product })}
              onDelete={handleDelete}
              onAdjust={handleAdjust}
              onAdd={() => setDrawer({ open: true, product: null })}
              onClear={() => setFilters(DEFAULT_FILTERS)}
            />
          )}
        </section>
      </main>

      {drawer.open && (
        <ProductDrawer
          key={drawer.product?.id ?? "new"}
          product={drawer.product}
          categories={categories.map(([name]) => name)}
          onClose={closeDrawer}
          onSave={handleSave}
        />
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
    </>
  );
}
