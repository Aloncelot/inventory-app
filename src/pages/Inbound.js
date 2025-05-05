// src/pages/Inbound.js
import React, { useState, useMemo } from "react";
import { useInventory } from "../context/InventoryContext";
import { db } from "../firebaseClient";
import {
  collection,
  doc,
  writeBatch,
  serverTimestamp,
  increment,
} from "firebase/firestore";

export default function Inbound() {
  const { items } = useInventory();
  const [rows, setRows] = useState([
    { material: "", category: "", sku: "", qty: "" },
  ]);
  const [status, setStatus] = useState("");

  // autocomplete materiales
  const materialOptions = useMemo(() => items.map((i) => i.material), [items]);

  const handleRowChange = (idx, field, value) => {
    const copy = [...rows];
    copy[idx][field] = value;
    if (field === "material") {
      const f = items.find((i) => i.material === value);
      copy[idx].category = f?.category || "";
      copy[idx].sku = f?.sku || "";
    }
    setRows(copy);
  };

  const addRow = () => {
    setRows((r) => [...r, { material: "", category: "", sku: "", qty: "" }]);
  };

  const handleConfirmInbound = async () => {
    try {
      const batch = writeBatch(db);
      rows.forEach((r) => {
        if (!r.sku || !r.qty) return;
        // registro log
        const logRef = doc(collection(db, "inboundLogs"));
        batch.set(logRef, {
          sku: r.sku,
          material: r.material,
          category: r.category,
          qty: Number(r.qty),
          timestamp: serverTimestamp(),
        });
        // update inventory
        const itRef = doc(db, "inventoryItems", r.sku);
        batch.update(itRef, {
          inbound: increment(Number(r.qty)),
          total: increment(Number(r.qty)),
          lastCountDate: serverTimestamp(),
        });
      });
      await batch.commit();
      setStatus("✅ Inbound registrado correctamente");
      setRows([{ material: "", category: "", sku: "", qty: "" }]);
    } catch {
      setStatus("❌ Error registrando inbound");
    }
  };

  return (
    <div className="inbound-container">
      <h1>Inbound Masivo</h1>
      {status && <p className="status">{status}</p>}

      <section className="inbound-section">
        <h2>Registrar Entradas</h2>
        <table className="inbound-table">
          <thead>
            <tr>
              <th>Material</th>
              <th>Categoría</th>
              <th>SKU</th>
              <th>Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>
                  <input
                    list="materials"
                    value={r.material}
                    onChange={(e) =>
                      handleRowChange(i, "material", e.target.value)
                    }
                  />
                  <datalist id="materials">
                    {materialOptions.map((m) => (
                      <option key={m} value={m} />
                    ))}
                  </datalist>
                </td>
                <td>
                  <input value={r.category} readOnly />
                </td>
                <td>
                  <input value={r.sku} readOnly />
                </td>
                <td>
                  <input
                    type="number"
                    value={r.qty}
                    onChange={(e) => handleRowChange(i, "qty", e.target.value)}
                    min="0"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="inbound-buttons">
          <button onClick={addRow}>+ Agregar Fila</button>
          <button onClick={handleConfirmInbound}>Confirmar Inbound</button>
        </div>
      </section>
    </div>
  );
}
