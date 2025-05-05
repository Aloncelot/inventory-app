import React from "react";
import ReactDOM from "react-dom/client"; // React 18
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { InventoryProvider } from "./context/InventoryContext";
import "./styles.scss";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <InventoryProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </InventoryProvider>
);
