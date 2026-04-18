const listValidator = require("../validators/list.validator");
const itemValidator = require("../validators/item.validator");

function sendValidationError(res) {
  return res.status(400).json({
    success: false,
    error: "validation error",
  });
}

function validateListCreate(req, res, next) {
  if (!listValidator.validateListCreate(req.body)) {
    return sendValidationError(res);
  }

  return next();
}

function validateListUpdate(req, res, next) {
  if (!listValidator.validateListUpdate(req.body)) {
    return sendValidationError(res);
  }

  return next();
}

function validateListId(req, res, next) {
  if (!listValidator.validateListId(req.params)) {
    return sendValidationError(res);
  }

  return next();
}

function validateItemCreate(req, res, next) {
  if (!itemValidator.validateItemCreate(req.body)) {
    return sendValidationError(res);
  }

  return next();
}

function validateItemUpdate(req, res, next) {
  if (!itemValidator.validateItemUpdate(req.body)) {
    return sendValidationError(res);
  }

  return next();
}

function validateItemStatusUpdate(req, res, next) {
  if (!itemValidator.validateItemStatusUpdate(req.body)) {
    return sendValidationError(res);
  }

  return next();
}

function validateItemListId(req, res, next) {
  if (!itemValidator.validateListId(req.params)) {
    return sendValidationError(res);
  }

  return next();
}

function validateListItemIds(req, res, next) {
  if (!itemValidator.validateListItemIds(req.params)) {
    return sendValidationError(res);
  }

  return next();
}

module.exports = {
  validateListCreate,
  validateListUpdate,
  validateListId,
  validateItemCreate,
  validateItemUpdate,
  validateItemStatusUpdate,
  validateItemListId,
  validateListItemIds,
};
