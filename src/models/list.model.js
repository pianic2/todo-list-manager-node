const db = require("../db/database");

// Insert a new list and return the created row.
function createList(data) {
  const stmt = db.prepare(`
    INSERT INTO lists (title, description)
    VALUES (?, ?)
  `);
  const result = stmt.run(data.title, data.description ?? null);
  return getListById(result.lastInsertRowid);
}

// Return all lists ordered from newest to oldest.
function getAllLists() {
  return db.prepare(`
    SELECT * FROM lists ORDER BY created_at DESC
  `).all();
}

// Return a single list by its primary key, or undefined if not found.
function getListById(id) {
  return db.prepare(`
    SELECT * FROM lists WHERE id = ?
  `).get(id);
}

// Update title and description of an existing list.
// Returns the updated row, or undefined if no row matched.
function updateList(id, data) {
  const stmt = db.prepare(`
    UPDATE lists
    SET title = ?, description = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  const result = stmt.run(data.title, data.description ?? null, id);
  if (result.changes === 0) return undefined;
  return getListById(id);
}

// Delete a list by id. Returns true if a row was deleted.
function deleteList(id) {
  const result = db.prepare(`
    DELETE FROM lists WHERE id = ?
  `).run(id);
  return result.changes > 0;
}

module.exports = { createList, getAllLists, getListById, updateList, deleteList };
