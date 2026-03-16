const db = require("../db/database");

// Insert a new item inside the given list and return the created row.
function createItem(listId, data) {
  const stmt = db.prepare(`
    INSERT INTO items (text, status, list_id)
    VALUES (?, ?, ?)
  `);
  const result = stmt.run(data.text, data.status ?? "todo", listId);
  return getItemById(result.lastInsertRowid);
}

// Return all items that belong to the given list, ordered oldest first.
function getItemsByList(listId) {
  return db.prepare(`
    SELECT * FROM items
    WHERE list_id = ?
    ORDER BY created_at ASC
  `).all(listId);
}

// Return a single item by its primary key, or undefined if not found.
function getItemById(itemId) {
  return db.prepare(`
    SELECT * FROM items WHERE id = ?
  `).get(itemId);
}

// Update the text of an existing item.
// Returns the updated row, or undefined if no row matched.
function updateItem(itemId, data) {
  const stmt = db.prepare(`
    UPDATE items
    SET text = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  const result = stmt.run(data.text, itemId);
  if (result.changes === 0) return undefined;
  return getItemById(itemId);
}

// Delete an item by id. Returns true if a row was deleted.
function deleteItem(itemId) {
  const result = db.prepare(`
    DELETE FROM items WHERE id = ?
  `).run(itemId);
  return result.changes > 0;
}

// Change the status of an item ('todo' or 'done').
// Returns the updated row, or undefined if no row matched.
function changeStatus(itemId, status) {
  const stmt = db.prepare(`
    UPDATE items
    SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  const result = stmt.run(status, itemId);
  if (result.changes === 0) return undefined;
  return getItemById(itemId);
}

module.exports = {
  createItem,
  getItemsByList,
  getItemById,
  updateItem,
  deleteItem,
  changeStatus,
};
