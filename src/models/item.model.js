const db = require("../db/database");

// Insert a new item inside the given list and return the created row.
function createItem(listId, data) {
  const stmt = db.prepare(`
    INSERT INTO items (text, status, list_id)
    VALUES (?, ?, ?)
  `);
  const result = stmt.run(data.text, data.status ?? "todo", listId);
  return getItemById(listId, result.lastInsertRowid);
}

// Return all items that belong to the given list, ordered oldest first.
function getItemsByList(listId) {
  return db.prepare(`
    SELECT * FROM items
    WHERE list_id = ? AND deleted = 0
    ORDER BY created_at ASC
  `).all(listId);
}

// Return a single item in the given list, or undefined if not found.
function getItemById(listId, itemId) {
  return db.prepare(`
    SELECT * FROM items
    WHERE id = ? AND list_id = ? AND deleted = 0
  `).get(itemId, listId);
}

// Update the text of an existing item.
// Returns the updated row, or undefined if no row matched.
function updateItem(listId, itemId, data) {
  const stmt = db.prepare(`
    UPDATE items
    SET text = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND list_id = ? AND deleted = 0
  `);
  const result = stmt.run(data.text, itemId, listId);
  if (result.changes === 0) return undefined;
  return getItemById(listId, itemId);
}

// Delete an item in the given list. Returns true if a row was deleted.
function deleteItem(listId, itemId) {
  const result = db.prepare(`
    UPDATE items
    SET deleted = 1, deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND list_id = ? AND deleted = 0
  `).run(itemId, listId);
  return result.changes > 0;
}

// Change the status of an item ('todo' or 'done').
// Returns the updated row, or undefined if no row matched.
function changeStatus(listId, itemId, status) {
  const stmt = db.prepare(`
    UPDATE items
    SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND list_id = ? AND deleted = 0
  `);
  const result = stmt.run(status, itemId, listId);
  if (result.changes === 0) return undefined;
  return getItemById(listId, itemId);
}

module.exports = {
  createItem,
  getItemsByList,
  getItemById,
  updateItem,
  deleteItem,
  changeStatus,
};
