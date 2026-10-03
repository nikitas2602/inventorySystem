import type { Stats } from "../types";
import { formatMoney } from "../utils";

export default function StatsBar({ stats }: { stats: Stats | null }) {
  const attention = stats ? stats.low_stock + stats.out_of_stock : 0;
  const items = [
    { label: "Products", value: stats ? stats.total_products : "–" },
    { label: "Units on hand", value: stats ? stats.total_units.toLocaleString("en-IN") : "–" },
    { label: "Stock value", value: stats ? formatMoney(stats.inventory_value) : "–" },
    { label: "Need reordering", value: stats ? attention : "–", warn: attention > 0 },
  ];

  return (
    <div className="stats">
      {items.map((item) => (
        <div className="stat" key={item.label}>
          <b className={item.warn ? "warn" : ""}>{item.value}</b>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
