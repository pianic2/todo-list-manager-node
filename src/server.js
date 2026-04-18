const express = require("express");
const cors = require("cors");
const path = require("path");
const listsRoutes = require("./routes/lists.routes");
const itemsRoutes = require("./routes/items.routes");
const loggerMiddleware = require("./middleware/logger.middleware");
const errorHandler = require("./middleware/error.middleware");
const { readRuntimeConfig } = require("./config/runtime.config");

const app = express();
const PORT = process.env.PORT || 3000;
const runtimeConfig = readRuntimeConfig(process.env, { requireCorsOrigin: true });

function createCorsOptions(corsOrigins) {
  if (corsOrigins.includes("*")) {
    return { origin: "*" };
  }

  return {
    origin(origin, callback) {
      if (!origin || corsOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
  };
}

function createRateLimiter({ windowMs, maxRequests }) {
  const hitsByIp = new Map();

  return function rateLimiter(req, res, next) {
    const now = Date.now();
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const current = hitsByIp.get(ip);

    if (!current || now >= current.resetAt) {
      hitsByIp.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }

    current.count += 1;

    if (current.count > maxRequests) {
      res.set("Retry-After", String(Math.ceil((current.resetAt - now) / 1000)));
      return res.status(429).json({
        success: false,
        error: "too many requests",
      });
    }

    return next();
  };
}

function readOnlyMiddleware(req, res, next) {
  if (!runtimeConfig.readOnly || req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
    return next();
  }

  return res.status(405).json({
    success: false,
    error: "read-only demo",
  });
}

app.use(cors(createCorsOptions(runtimeConfig.corsOrigins)));
app.use(createRateLimiter(runtimeConfig.rateLimit));

// Parse incoming JSON payloads.
app.use(express.json());
app.use(loggerMiddleware);
app.use(express.static(path.resolve(__dirname, "../frontend")));

// Health check endpoint for initial setup validation.
app.get("/", (req, res) => {
  res.json({ status: "ok" });
});
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use(readOnlyMiddleware);

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
