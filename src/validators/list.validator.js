function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isPositiveIntegerId(value) {
  return typeof value === "string" && /^[1-9]\d*$/.test(value);
}

function hasValidTitle(body) {
  return typeof body.title === "string" && body.title.trim() !== "";
}

function hasValidDescription(body) {
  return body.description === undefined || body.description === null || typeof body.description === "string";
}

function validateListCreate(body) {
  if (!isPlainObject(body) || !hasValidTitle(body) || !hasValidDescription(body)) {
    return false;
  }

  return true;
}

function validateListUpdate(body) {
  if (!isPlainObject(body) || !hasValidTitle(body) || !hasValidDescription(body)) {
    return false;
  }

  return true;
}

function validateListId(params) {
  return isPositiveIntegerId(params.id);
}

module.exports = {
  validateListCreate,
  validateListUpdate,
  validateListId,
};
