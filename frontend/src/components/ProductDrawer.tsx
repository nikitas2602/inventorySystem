import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { X } from "lucide-react";
import type { Product, ProductInput } from "../types";

interface Props {
  product: Product | null;
  categories: string[];
  onClose: () => void;
  onSave: (data: ProductInput, id?: number) => Promise<void>;
}

// Form fields are strings while typing; they're converted to numbers on submit.
interface FormState {
  name: string;
  sku: string;
  category: string;
  price: string;
  quantity: string;
  reorder_level: string;
}

const EMPTY: FormState = { name: "", sku: "", category: "", price: "", quantity: "", reorder_level: "10" };

const toForm = (p: Product): FormState => ({
  name: p.name,
  sku: p.sku,
  category: p.category,
  price: String(p.price),
  quantity: String(p.quantity),
  reorder_level: String(p.reorder_level),
});

export default function ProductDrawer({ product, categories, onClose, onSave }: Props) {
  const [form, setForm] = useState<FormState>(product ? toForm(product) : EMPTY);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const editing = product !== null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const change = (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSave(
        {
          name: form.name.trim(),
          sku: form.sku.trim().toUpperCase(),
          category: form.category.trim(),
          price: Number(form.price),
          quantity: parseInt(form.quantity, 10),
          reorder_level: parseInt(form.reorder_level, 10),
        },
        product?.id
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save product");
      setSaving(false);
    }
  };

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={editing ? "Edit product" : "Add product"}>
        <div className="drawer-head">
          <h2>{editing ? "Edit product" : "Add product"}</h2>
          <button className="icon" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <form onSubmit={submit}>
          <label>Name
            <input name="name" value={form.name} onChange={change} required autoFocus />
          </label>
          <div className="two">
            <label>SKU
              <input name="sku" value={form.sku} onChange={change} required placeholder="EL-1001" />
            </label>
            <label>Category
              <input name="category" value={form.category} onChange={change} required list="cats" />
              <datalist id="cats">{categories.map((c) => <option key={c} value={c} />)}</datalist>
            </label>
          </div>
          <div className="two">
            <label>Price (₹)
              <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={change} required />
            </label>
            <label>Quantity
              <input name="quantity" type="number" min="0" step="1" value={form.quantity} onChange={change} required />
            </label>
          </div>
          <label>Reorder level
            <input name="reorder_level" type="number" min="0" step="1" value={form.reorder_level} onChange={change} required />
            <small>You'll see a low-stock warning at or below this number.</small>
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="drawer-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={saving}>
              {saving ? "Saving…" : editing ? "Save changes" : "Add product"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
