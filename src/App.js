// src/App.js
import React, { useState, useMemo } from "react";
import { useInventory } from "./context/InventoryContext";

// Formateador de moneda USD
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

export default function App() {
  const { items } = useInventory();
  const [filter, setFilter] = useState("");

  // Generar sugerencias únicas de SKU, categoría y material
  const suggestions = useMemo(() => {
    const set = new Set();
    items.forEach(({ sku, category, material }) => {
      if (sku) set.add(sku);
      if (category) set.add(category);
      if (material) set.add(material);
    });
    return Array.from(set);
  }, [items]);

  // Filtrado según el input
  const filtered = useMemo(() => {
    const f = filter.toString().toLowerCase();
    return items.filter(
      ({ sku, category, material }) =>
        sku.toString().toLowerCase().includes(f) ||
        (category || "").toLowerCase().includes(f) ||
        (material || "").toLowerCase().includes(f)
    );
  }, [items, filter]);

  return (
    <div className="app-container">
      <h1>Inventario</h1>

      <input
        type="text"
        list="search-suggestions"
        placeholder="Buscar SKU, categoría o material…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="search-input"
      />
      <datalist id="search-suggestions">
        {suggestions.map((s, idx) => (
          <option key={idx} value={s} />
        ))}
      </datalist>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Categoría</th>
              <th>Material</th>
              <th>Unidades</th>
              <th>Precio Sph</th>
              <th>Precio Cliente</th>
              <th>Stock Inicial</th>
              <th>Inbound</th>
              <th>Outbound</th>
              <th>Total</th>
              <th>Nivel Stock</th>
              <th>Último Conteo</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.sku}>
                <td>{item.sku}</td>
                <td>{item.category}</td>
                <td>{item.material}</td>
                <td>{item.units}</td>
                <td>{currencyFormatter.format(item.priceToSophava)}</td>
                <td>{currencyFormatter.format(item.priceToClient)}</td>
                <td>{item.initialStock}</td>
                <td>{item.inbound}</td>
                <td>{item.outbound}</td>
                <td>{item.total}</td>
                <td>
                  <span
                    className={`badge ${
                      item.stockLevel === "ON STOCK"
                        ? "on-stock"
                        : item.stockLevel === "LOW STOCK"
                        ? "low-stock"
                        : "no-stock"
                    }`}
                  >
                    {item.stockLevel}
                  </span>
                </td>
                <td>{item.lastCountDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
