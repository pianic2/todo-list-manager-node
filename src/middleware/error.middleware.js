function errorHandler(err, req, res, next) {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      error: "validation error",
    });
  }

  console.error(err);

  return res.status(500).json({
    success: false,
    error: "internal server error",
  });
}

module.exports = errorHandler;
