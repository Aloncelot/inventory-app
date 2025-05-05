import React from "react";
import { Link, Routes, Route } from "react-router-dom";

import InventoryList from "./pages/InventoryList";
import Inbound from "./pages/Inbound";
import NewMaterial from "./pages/NewMaterial";

export default function App() {
  return (
    <>
      <nav style={{ padding: "1rem", background: "#111" }}>
        <Link to="/" style={{ marginRight: ".5rem" }}>
          Inventario
        </Link>
        <Link to="/inbound" style={{ marginRight: ".5rem" }}>
          Inbound
        </Link>
        <Link to="/new-material">Nuevo Material</Link>
      </nav>

      <main style={{ padding: "1rem" }}>
        <Routes>
          <Route path="/" element={<InventoryList />} />
          <Route path="/inbound" element={<Inbound />} />
          <Route path="/new-material" element={<NewMaterial />} />
          <Route path="*" element={<InventoryList />} />
        </Routes>
      </main>
    </>
  );
}
