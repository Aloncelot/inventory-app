import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { InventoryProvider } from "./context/InventoryContext";
import "./styles.scss";

const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);
root.render(
  <InventoryProvider>
    <App />
  </InventoryProvider>
);
