const express = require("express");
const listsRoutes = require("./routes/lists.routes");
const itemsRoutes = require("./routes/items.routes");

const app = express();
const PORT = process.env.PORT || 3000;

// Parse incoming JSON payloads.
app.use(express.json());

// Health check endpoint for initial setup validation.
app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

// Mount route modules.
app.use("/lists", listsRoutes);
app.use("/", itemsRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
