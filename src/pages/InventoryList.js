// src/pages/InventoryList.js
import React, { useState, useMemo, useCallback } from "react";
import { useInventory } from "../context/InventoryContext";

export default function InventoryList() {
  const { items, deleteItem } = useInventory();
  const [filter, setFilter] = useState("");

  // Helper de formateo de fecha (igual que antes)…
  const formatDate = useCallback((ts) => {
    if (!ts) return "";
    if (ts.toDate) return ts.toDate().toLocaleString();
    if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleString();
    return String(ts);
  }, []);

  // Helper de formateo de moneda…
  const formatCurrency = useCallback(
    (amount) =>
      amount != null && !isNaN(amount)
        ? amount.toLocaleString("en-US", { style: "currency", currency: "USD" })
        : "",
    [],
    []
  );

  // Helper para números enteros
  const safeNumber = useCallback((n) => (Number.isFinite(n) ? n : ""), [], []);

  // Filtrado…
  const filtered = useMemo(() => {
    const f = filter.toLowerCase();
    return items.filter(
      ({ sku, category = "", material = "" }) =>
        sku.toString().includes(f) ||
        category.toLowerCase().includes(f) ||
        material.toLowerCase().includes(f)
    );
  }, [items, filter]);

  return (
    <div className="inventory-list">
      <h1>Inventario</h1>
      <input
        className="search-input"
        type="text"
        placeholder="Buscar por SKU, categoría o material…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Categoría</th>
              <th>Material</th>
              <th className="text-center">Unidades</th>
              <th className="text-right">Precio Sph</th>
              <th className="text-right">Precio Cliente</th>
              <th className="text-center">Stock Inicial</th>
              <th className="text-center">Inbound</th>
              <th className="text-center">Outbound</th>
              <th className="text-center">Total</th>
              <th className="text-center">Nivel Stock</th>
              <th className="text-center">Último Conteo</th>
              <th className="text-center">Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.sku}>
                <td>{item.sku}</td>
                <td>{item.category}</td>
                <td>{item.material}</td>
                <td className="text-center">{safeNumber(item.units)}</td>
                <td className="text-right">
                  {formatCurrency(item.priceToSophava)}
                </td>
                <td className="text-right">
                  {formatCurrency(item.priceToClient)}
                </td>
                <td className="text-center">{safeNumber(item.initialStock)}</td>
                <td className="text-center">{safeNumber(item.inbound)}</td>
                <td className="text-center">{safeNumber(item.outbound)}</td>
                <td className="text-center">{safeNumber(item.total)}</td>
                <td className="text-center">
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
                <td className="text-center">
                  {formatDate(item.lastCountDate)}
                </td>
                <td className="text-center">
                  <button
                    className="delete-btn"
                    aria-label={`Eliminar SKU ${item.sku}`}
                    onClick={() =>
                      window.confirm(`¿Eliminar SKU ${item.sku}?`) &&
                      deleteItem(item.sku)
                    }
                  >
                    🗑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
