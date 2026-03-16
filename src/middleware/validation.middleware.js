function sendValidationError(res) {
  return res.status(400).json({
    success: false,
    error: "validation error",
  });
}

function validateListCreate(req, res, next) {
  const { title } = req.body || {};

  if (typeof title !== "string" || title.trim() === "") {
    return sendValidationError(res);
  }

  return next();
}

function validateItemCreate(req, res, next) {
  const { text, status } = req.body || {};

  if (typeof text !== "string" || text.trim() === "") {
    return sendValidationError(res);
  }

  if (status !== undefined && status !== "todo" && status !== "done") {
    return sendValidationError(res);
  }

  return next();
}

module.exports = {
  validateListCreate,
  validateItemCreate,
};
