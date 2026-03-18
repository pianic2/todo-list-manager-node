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
    SELECT * FROM lists
    WHERE deleted = 0
    ORDER BY created_at DESC
  `).all();
}

// Return a single list by its primary key, or undefined if not found.
function getListById(id) {
  return db.prepare(`
    SELECT * FROM lists
    WHERE id = ? AND deleted = 0
  `).get(id);
}

// Update title and description of an existing list.
// Returns the updated row, or undefined if no row matched.
function updateList(id, data) {
  const stmt = db.prepare(`
    UPDATE lists
    SET title = ?, description = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND deleted = 0
  `);
  const result = stmt.run(data.title, data.description ?? null, id);
  if (result.changes === 0) return undefined;
  return getListById(id);
}

// Delete a list by id. Returns true if a row was deleted.
function deleteList(id) {
  const softDeleteListWithItems = db.transaction((listId) => {
    const result = db.prepare(`
      UPDATE lists
      SET deleted = 1, deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND deleted = 0
    `).run(listId);

    if (result.changes === 0) {
      return false;
    }

    db.prepare(`
      UPDATE items
      SET deleted = 1, deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE list_id = ? AND deleted = 0
    `).run(listId);

    return true;
  });

  return softDeleteListWithItems(id);
}

module.exports = { createList, getAllLists, getListById, updateList, deleteList };
