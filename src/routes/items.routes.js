const express = require("express");
const router = express.Router();
const itemsController = require("../controllers/items.controller");
const { validateItemCreate } = require("../middleware/validation.middleware");

router.get("/:listId/items", itemsController.getItems);
router.get("/:listId/items/:itemId", itemsController.getItem);
router.post("/:listId/items", validateItemCreate, itemsController.createItem);
router.put("/:listId/items/:itemId", itemsController.updateItem);
router.delete("/:listId/items/:itemId", itemsController.deleteItem);
router.patch("/:listId/items/:itemId/status", itemsController.changeStatus);

module.exports = router;
