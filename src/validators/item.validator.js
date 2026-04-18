function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isPositiveIntegerId(value) {
  return typeof value === "string" && /^[1-9]\d*$/.test(value);
}

function hasValidText(body) {
  return typeof body.text === "string" && body.text.trim() !== "";
}

function hasValidStatusValue(status) {
  return status === "todo" || status === "done";
}

function validateItemCreate(body) {
  if (!isPlainObject(body) || !hasValidText(body)) {
    return false;
  }

  if (body.status !== undefined && !hasValidStatusValue(body.status)) {
    return false;
  }

  return true;
}

function validateItemUpdate(body) {
  if (!isPlainObject(body) || !hasValidText(body)) {
    return false;
  }

  return true;
}

function validateItemStatusUpdate(body) {
  if (!isPlainObject(body) || !hasValidStatusValue(body.status)) {
    return false;
  }

  return true;
}

function validateListItemIds(params) {
  return isPositiveIntegerId(params.listId) && isPositiveIntegerId(params.itemId);
}

function validateListId(params) {
  return isPositiveIntegerId(params.listId);
}

module.exports = {
  validateItemCreate,
  validateItemUpdate,
  validateItemStatusUpdate,
  validateListItemIds,
  validateListId,
};
