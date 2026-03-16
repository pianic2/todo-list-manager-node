const ListModel = require("../models/list.model");

// POST /lists — create a new list.
function createList(req, res, next) {
  try {
    const { title, description } = req.body;
    const list = ListModel.createList({ title, description });
    res.status(201).json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
}

// GET /lists — return all lists.
function getLists(req, res, next) {
  try {
    const lists = ListModel.getAllLists();
    res.status(200).json({ success: true, data: lists });
  } catch (error) {
    next(error);
  }
}

// GET /lists/:id — return a single list, 404 if not found.
function getList(req, res, next) {
  try {
    const list = ListModel.getListById(req.params.id);
    if (!list) {
      return res.status(404).json({ success: false, error: "List not found" });
    }
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
}

// PUT /lists/:id — update title and/or description of a list.
function updateList(req, res, next) {
  try {
    const { title, description } = req.body;
    const list = ListModel.updateList(req.params.id, { title, description });
    if (!list) {
      return res.status(404).json({ success: false, error: "List not found" });
    }
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
}

// DELETE /lists/:id — remove a list, 404 if it did not exist.
function deleteList(req, res, next) {
  try {
    const deleted = ListModel.deleteList(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: "List not found" });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { createList, getLists, getList, updateList, deleteList };
