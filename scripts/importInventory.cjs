// scripts/importInventory.cjs

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { google } = require("googleapis");

// Carga tu JSON de Service Account de inventory-app-9469e
const serviceAccount = require("./inventory-admin.json");

// Inicializa Firestore Admin
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// Inicializa cliente de Google Sheets
const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});
const sheetsApi = google.sheets({ version: "v4", auth });

(async () => {
  // Leemos solo columnas B–M (SKU en B, fecha en M)
  const res = await sheetsApi.spreadsheets.values.get({
    spreadsheetId: "125-MismOfz2aP8ImpUktyfzesI7GXXugVoRwOxvIZ1M",
    range: "Inventory!B5:M",
  });

  const rows = res.data.values || [];

  for (const row of rows) {
    const [
      sku, // B
      category, // C
      material, // D
      units, // E
      priceSoph, // F
      priceClient, // G
      stock, // H
      inbound, // I
      outbound, // J
      total, // K
      stockLevel, // L
      lastCountDate, // M
    ] = row;

    if (!sku) continue; // saltamos filas sin SKU

    // Si la fecha está vacía, asignamos valor por defecto
    let countDate = lastCountDate;
    if (!countDate || countDate.trim() === "") {
      countDate = "1/1/2025";
    }

    // Construimos el objeto
    const docData = {
      category,
      material,
      units,
      priceToSophava: Number(priceSoph.replace(/[^0-9.-]+/g, "")),
      priceToClient: Number(priceClient.replace(/[^0-9.-]+/g, "")),
      initialStock: Number(stock.replace(/,/g, "")),
      inbound: Number(inbound || 0),
      outbound: Number(outbound || 0),
      total: Number(total || 0),
      stockLevel,
      lastCountDate: countDate,
    };

    // Subimos a Firestore
    await db
      .collection("inventoryItems")
      .doc(sku)
      .set(docData, { merge: true });
  }

  // Fin de la importación
  console.log("🎉 ¡Importación completada!");
})().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
