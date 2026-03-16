const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// Parse incoming JSON payloads.
app.use(express.json());

// Health check endpoint for initial setup validation.
app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
