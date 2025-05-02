import React, { createContext, useContext, useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseClient";

const InventoryContext = createContext();
export const useInventory = () => useContext(InventoryContext);

export function InventoryProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Suscripción en tiempo real a la colección
    const unsubscribe = onSnapshot(
      collection(db, "inventoryItems"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          sku: doc.id,
          ...doc.data(),
        }));
        setItems(data);
      },
      (err) => {
        console.error("Error escuchando inventoryItems:", err);
      }
    );
    return unsubscribe; // limpia la suscripción al desmontar
  }, []);

  return (
    <InventoryContext.Provider value={{ items }}>
      {children}
    </InventoryContext.Provider>
  );
}
