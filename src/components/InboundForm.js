// src/components/InboundForm.js
import React, { useState, useMemo } from "react";
import { useInventory } from "../context/InventoryContext";

export default function InboundForm() {
  const { items, addInbound } = useInventory();
  const [sku, setSku] = useState("");
  const [qty, setQty] = useState(1);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Sugerencias de SKU para autocomplete
  const skuOptions = useMemo(() => {
    if (!sku) return [];
    return items
      .map((i) => i.sku)
      .filter((s) => s.includes(sku))
      .slice(0, 10);
  }, [sku, items]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      if (!items.find((i) => i.sku === sku)) {
        throw new Error("SKU no válido");
      }
      await addInbound({ sku, qty: Number(qty), date: new Date(date) });
      setSuccess(`Entrada registrada para ${sku} (+${qty})`);
      setSku("");
      setQty(1);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form className="inbound-form" onSubmit={handleSubmit}>
      <h2>Registrar Inbound</h2>

      <label>
        SKU
        <input
          list="sku-list"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          required
        />
        <datalist id="sku-list">
          {skuOptions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </label>

      <label>
        Cantidad
        <input
          type="number"
          min="1"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          required
        />
      </label>

      <label>
        Fecha
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </label>

      <button type="submit">Registrar Entrada</button>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </form>
  );
}
