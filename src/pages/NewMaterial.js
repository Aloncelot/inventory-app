import React, { useState, useMemo, useCallback } from "react";
import { serverTimestamp } from "firebase/firestore";
import { useInventory } from "../context/InventoryContext";

export default function NewMaterial() {
  const { items, addNewMaterial } = useInventory();

  // 1) Opciones para los dropdowns (memoizadas)
  const materialOptions = useMemo(
    () => Array.from(new Set(items.map((i) => i.material))),
    [items]
  );
  const categoryOptions = useMemo(
    () => Array.from(new Set(items.map((i) => i.category))),
    [items]
  );
  const unitsOptions = useMemo(
    () => Array.from(new Set(items.map((i) => i.units))),
    [items]
  );
  const percentOptions = useMemo(
    () =>
      [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5].map((v) => ({
        label: `${v * 100}%`,
        value: v,
      })),
    []
  );

  // 2) Generación incremental de SKU
  const maxSku = useMemo(() => {
    const nums = items.map((i) => parseInt(i.sku, 10)).filter((n) => !isNaN(n));
    return nums.length ? Math.max(...nums) : 0;
  }, [items]);
  const [skuCounter, setSkuCounter] = useState(maxSku);
  const genSku = useCallback(() => {
    const next = skuCounter + 1 + Math.floor(Math.random() * 9) + 1;
    setSkuCounter(next);
    return String(next);
  }, [skuCounter]);

  // 3) Estado de las filas
  const [rows, setRows] = useState(() => [
    {
      material: "",
      category: "",
      units: "", // <-- nueva columna
      sku: genSku(),
      priceSph: "",
      percent: percentOptions[3].value, // 20% por defecto
    },
  ]);

  // 4) Añadir fila
  const addRow = useCallback(() => {
    setRows((r) => [
      ...r,
      {
        material: "",
        category: "",
        units: "",
        sku: genSku(),
        priceSph: "",
        percent: percentOptions[3].value,
      },
    ]);
  }, [genSku, percentOptions]);

  // 5) Actualizar campo
  const updateRow = useCallback((idx, field, value) => {
    setRows((r) => {
      const cp = [...r];
      cp[idx] = { ...cp[idx], [field]: value };
      return cp;
    });
  }, []);

  // 6) Confirmar y guardar en Firestore
  const handleConfirm = useCallback(async () => {
    for (const { material, category, units, sku, priceSph, percent } of rows) {
      if (!material || !category || !units || !sku || !priceSph) continue;
      const priceClient = Number(priceSph) * (1 + Number(percent));
      await addNewMaterial({
        sku,
        material,
        category,
        units, // <-- pasamos las unidades
        priceToSophava: Number(priceSph),
        priceToClient: priceClient,
        initialStock: 0,
        inbound: 0,
        outbound: 0,
        total: 0,
        stockLevel: "NO STOCK",
        lastCountDate: serverTimestamp(),
      });
    }
    alert("🎉 Materiales creados con éxito");
    setRows([
      {
        material: "",
        category: "",
        units: "",
        sku: genSku(),
        priceSph: "",
        percent: percentOptions[3].value,
      },
    ]);
  }, [rows, addNewMaterial, genSku, percentOptions]);

  return (
    <div className="new-material-section">
      <h1>Alta de Nuevo Material</h1>
      <table className="new-material-table">
        <thead>
          <tr>
            <th>Material</th>
            <th>Categoría</th>
            <th>Unidades</th> {/* <-- nueva columna */}
            <th>SKU</th>
            <th>Precio Sph</th>
            <th>%</th>
            <th>Precio Cliente</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const priceClient = r.priceSph
              ? (Number(r.priceSph) * (1 + Number(r.percent))).toFixed(2)
              : "";
            return (
              <tr key={i}>
                <td>
                  <input
                    type="text"
                    list="materials"
                    value={r.material}
                    onChange={(e) => updateRow(i, "material", e.target.value)}
                  />
                  <datalist id="materials">
                    {materialOptions.map((m) => (
                      <option key={m} value={m} />
                    ))}
                  </datalist>
                </td>
                <td>
                  <select
                    value={r.category}
                    onChange={(e) => updateRow(i, "category", e.target.value)}
                  >
                    <option value="">-- Selecciona --</option>
                    {categoryOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={r.units}
                    onChange={(e) => updateRow(i, "units", e.target.value)}
                  >
                    <option value="">-- Selecciona unidades --</option>
                    {unitsOptions.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input readOnly value={r.sku} />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    value={r.priceSph}
                    onChange={(e) => updateRow(i, "priceSph", e.target.value)}
                  />
                </td>
                <td style={{ minWidth: "100px" }}>
                  <select
                    value={r.percent}
                    onChange={(e) => updateRow(i, "percent", e.target.value)}
                  >
                    {percentOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input readOnly value={priceClient} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="new-material-buttons">
        <button onClick={addRow}>＋ Agregar Fila</button>
        <button onClick={handleConfirm}>Confirmar Materiales</button>
      </div>
    </div>
  );
}
