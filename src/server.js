const express = require("express");
const listsRoutes = require("./routes/lists.routes");
const itemsRoutes = require("./routes/items.routes");
const loggerMiddleware = require("./middleware/logger.middleware");
const errorHandler = require("./middleware/error.middleware");

const app = express();
const PORT = process.env.PORT || 3000;

// Parse incoming JSON payloads.
app.use(express.json());
app.use(loggerMiddleware);

// Health check endpoint for initial setup validation.
app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

// Mount route modules.
app.use("/lists", listsRoutes);
app.use("/lists", itemsRoutes);

// Centralized error handling should run after all routes.
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
