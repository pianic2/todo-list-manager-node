function errorHandler(err, req, res, next) {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      error: "validation error",
    });
  }

  console.error(err);

  res.status(500).json({
    success: false,
    error: err.message || "internal server error",
  });
}

module.exports = errorHandler;
