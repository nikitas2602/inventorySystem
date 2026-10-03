import { Search } from "lucide-react";
import type { Filters } from "../types";

interface Props {
  filters: Filters;
  setFilters: (filters: Filters) => void;
  categories: [string, number][];
  total: number;
}

export default function Toolbar({ filters, setFilters, categories, total }: Props) {
  const set = (patch: Partial<Filters>) => setFilters({ ...filters, ...patch });

  return (
    <div className="toolbar">
      <div className="toolbar-row">
        <label className="search">
          <Search size={17} />
          <input
            type="search"
            placeholder="Search by name or SKU"
            value={filters.query}
            onChange={(e) => set({ query: e.target.value })}
          />
        </label>
        <select
          value={filters.status}
          onChange={(e) => set({ status: e.target.value as Filters["status"] })}
          aria-label="Filter by stock status"
        >
          <option value="all">All stock levels</option>
          <option value="ok">In stock</option>
          <option value="low">Low stock</option>
          <option value="out">Out of stock</option>
        </select>
      </div>

      <div className="chips">
        <button className={`chip ${filters.category === "All" ? "on" : ""}`} onClick={() => set({ category: "All" })}>
          All <em>{total}</em>
        </button>
        {categories.map(([name, count]) => (
          <button
            key={name}
            className={`chip ${filters.category === name ? "on" : ""}`}
            onClick={() => set({ category: name })}
          >
            {name} <em>{count}</em>
          </button>
        ))}
      </div>
    </div>
  );
}
