function sendValidationError(res, message) {
  return res.status(400).json({
    success: false,
    error: message || "validation error",
  });
}

function validateListCreate(req, res, next) {
  const { title } = req.body || {};

  if (typeof title !== "string" || title.trim() === "") {
    return sendValidationError(res, "validation error");
  }

  return next();
}

function validateItemCreate(req, res, next) {
  const { text, status } = req.body || {};

  if (typeof text !== "string" || text.trim() === "") {
    return sendValidationError(res, "validation error");
  }

  if (status !== undefined && status !== "todo" && status !== "done") {
    return sendValidationError(res, "validation error");
  }

  return next();
}

module.exports = {
  validateListCreate,
  validateItemCreate,
};
