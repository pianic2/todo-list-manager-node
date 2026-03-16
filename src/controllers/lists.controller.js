const ListModel = require("../models/list.model");

// POST /lists — create a new list.
function createList(req, res) {
  try {
    const { title, description } = req.body;
    const list = ListModel.createList({ title, description });
    res.status(201).json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// GET /lists — return all lists.
function getLists(req, res) {
  try {
    const lists = ListModel.getAllLists();
    res.json({ success: true, data: lists });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// GET /lists/:id — return a single list, 404 if not found.
function getList(req, res) {
  try {
    const list = ListModel.getListById(req.params.id);
    if (!list) {
      return res.status(404).json({ success: false, error: "List not found" });
    }
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// PUT /lists/:id — update title and/or description of a list.
function updateList(req, res) {
  try {
    const { title, description } = req.body;
    const list = ListModel.updateList(req.params.id, { title, description });
    if (!list) {
      return res.status(404).json({ success: false, error: "List not found" });
    }
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// DELETE /lists/:id — remove a list, 404 if it did not exist.
function deleteList(req, res) {
  try {
    const deleted = ListModel.deleteList(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: "List not found" });
    }
    res.json({ success: true, data: null });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = { createList, getLists, getList, updateList, deleteList };
