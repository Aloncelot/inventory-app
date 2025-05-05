// src/context/InventoryContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebaseClient";

const InventoryContext = createContext({
  items: [],
  deleteItem: () => {},
  addNewMaterial: () => {},
});

export function InventoryProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "inventoryItems"),
      (snap) =>
        setItems(
          snap.docs.map((d) => ({
            sku: d.id,
            ...d.data(),
          }))
        ),
      (err) => console.error("Error al leer inventario:", err)
    );
    return () => unsub();
  }, []);

  async function deleteItem(sku) {
    await deleteDoc(doc(db, "inventoryItems", sku));
  }

  // ← Nueva firma: recibe UN OBJETO con sku y datos
  async function addNewMaterial(record) {
    const { sku, ...data } = record;
    // data ya contiene material, category, units, priceToSophava, priceToClient, etc.
    await setDoc(doc(db, "inventoryItems", sku), data, { merge: true });
  }

  return (
    <InventoryContext.Provider value={{ items, deleteItem, addNewMaterial }}>
      {children}
    </InventoryContext.Provider>
  );
}

export const useInventory = () => useContext(InventoryContext);
