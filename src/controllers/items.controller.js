const ItemModel = require("../models/item.model");

// POST /lists/:listId/items — create a new item inside the given list.
function createItem(req, res, next) {
  try {
    const { listId } = req.params;
    const { text, status } = req.body;
    const item = ItemModel.createItem(listId, { text, status });
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
}

// GET /lists/:listId/items — return all items belonging to a list.
function getItems(req, res, next) {
  try {
    const items = ItemModel.getItemsByList(req.params.listId);
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
}

// GET /lists/:listId/items/:itemId — return a single item, 404 if not found.
function getItem(req, res, next) {
  try {
    const item = ItemModel.getItemById(req.params.itemId);
    if (!item) {
      return res.status(404).json({ success: false, error: "Item not found" });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
}

// PUT /lists/:listId/items/:itemId — update text of an item.
function updateItem(req, res, next) {
  try {
    const { text } = req.body;
    const item = ItemModel.updateItem(req.params.itemId, { text });
    if (!item) {
      return res.status(404).json({ success: false, error: "Item not found" });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
}

// DELETE /lists/:listId/items/:itemId — remove an item.
function deleteItem(req, res, next) {
  try {
    const deleted = ItemModel.deleteItem(req.params.itemId);
    if (!deleted) {
      return res.status(404).json({ success: false, error: "Item not found" });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

// PATCH /lists/:listId/items/:itemId/status — update only the status field.
function changeStatus(req, res, next) {
  try {
    const { status } = req.body;
    const item = ItemModel.changeStatus(req.params.itemId, status);
    if (!item) {
      return res.status(404).json({ success: false, error: "Item not found" });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
}

module.exports = { createItem, getItems, getItem, updateItem, deleteItem, changeStatus };
