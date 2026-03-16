const ItemModel = require("../models/item.model");

// POST /lists/:listId/items — create a new item inside the given list.
function createItem(req, res) {
  try {
    const { listId } = req.params;
    const { text, status } = req.body;
    const item = ItemModel.createItem(listId, { text, status });
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// GET /lists/:listId/items — return all items belonging to a list.
function getItems(req, res) {
  try {
    const items = ItemModel.getItemsByList(req.params.listId);
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// GET /lists/:listId/items/:itemId — return a single item, 404 if not found.
function getItem(req, res) {
  try {
    const item = ItemModel.getItemById(req.params.itemId);
    if (!item) {
      return res.status(404).json({ success: false, error: "Item not found" });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// PUT /lists/:listId/items/:itemId — update text of an item.
function updateItem(req, res) {
  try {
    const { text } = req.body;
    const item = ItemModel.updateItem(req.params.itemId, { text });
    if (!item) {
      return res.status(404).json({ success: false, error: "Item not found" });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// DELETE /lists/:listId/items/:itemId — remove an item.
function deleteItem(req, res) {
  try {
    const deleted = ItemModel.deleteItem(req.params.itemId);
    if (!deleted) {
      return res.status(404).json({ success: false, error: "Item not found" });
    }
    res.json({ success: true, data: null });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// PATCH /lists/:listId/items/:itemId/status — update only the status field.
function changeStatus(req, res) {
  try {
    const { status } = req.body;
    const item = ItemModel.changeStatus(req.params.itemId, status);
    if (!item) {
      return res.status(404).json({ success: false, error: "Item not found" });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = { createItem, getItems, getItem, updateItem, deleteItem, changeStatus };
