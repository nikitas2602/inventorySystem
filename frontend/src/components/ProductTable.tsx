import { Minus, PackageOpen, Pencil, Plus, Trash2 } from "lucide-react";
import type { Product, Status } from "../types";
import { formatMoney, getStatus } from "../utils";

interface Props {
  products: Product[];
  hasProducts: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onAdjust: (product: Product, delta: number) => void;
  onAdd: () => void;
  onClear: () => void;
}

// The bar fills up to 3x the reorder level; the tick marks the reorder point.
function StockBar({ product, status }: { product: Product; status: Status }) {
  const max = Math.max(product.reorder_level * 3, 1);
  const fill = Math.min((product.quantity / max) * 100, 100);
  return (
    <div className="bar" title={`Reorder at ${product.reorder_level}`}>
      <div className={`bar-fill ${status.key}`} style={{ width: `${fill}%` }} />
      <span className="bar-tick" />
    </div>
  );
}

export default function ProductTable({ products, hasProducts, onEdit, onDelete, onAdjust, onAdd, onClear }: Props) {
  if (products.length === 0) {
    return (
      <div className="empty">
        <PackageOpen size={36} strokeWidth={1.5} />
        {hasProducts ? (
          <>
            <h3>No products match these filters</h3>
            <button className="btn btn-ghost" onClick={onClear}>Clear filters</button>
          </>
        ) : (
          <>
            <h3>Your shelves are empty</h3>
            <p>Add your first product to start tracking stock.</p>
            <button className="btn" onClick={onAdd}><Plus size={18} /> Add product</button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Stock</th>
            <th className="num">Price</th>
            <th>Status</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const status = getStatus(p);
            return (
              <tr key={p.id}>
                <td>
                  <div className="name">{p.name}</div>
                  <div className="sku">{p.sku}</div>
                </td>
                <td>{p.category}</td>
                <td>
                  <div className="stock">
                    <button className="icon" onClick={() => onAdjust(p, -1)} disabled={p.quantity === 0} aria-label={`Remove one ${p.name}`}>
                      <Minus size={14} />
                    </button>
                    <div className="stock-body">
                      <strong>{p.quantity}</strong>
                      <StockBar product={p} status={status} />
                    </div>
                    <button className="icon" onClick={() => onAdjust(p, 1)} aria-label={`Add one ${p.name}`}>
                      <Plus size={14} />
                    </button>
                  </div>
                </td>
                <td className="num">{formatMoney(p.price)}</td>
                <td><span className={`pill ${status.key}`}>{status.label}</span></td>
                <td className="actions">
                  <button className="icon" onClick={() => onEdit(p)} aria-label={`Edit ${p.name}`}><Pencil size={15} /></button>
                  <button className="icon danger" onClick={() => onDelete(p)} aria-label={`Delete ${p.name}`}><Trash2 size={15} /></button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
