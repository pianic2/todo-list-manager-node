const express = require("express");
const router = express.Router({ mergeParams: true });
const itemsController = require("../controllers/items.controller");

router.get("/:listId/items", itemsController.getItems);
router.get("/:listId/items/:itemId", itemsController.getItem);
router.post("/:listId/items", itemsController.createItem);
router.put("/:listId/items/:itemId", itemsController.updateItem);
router.delete("/:listId/items/:itemId", itemsController.deleteItem);
router.patch("/:listId/items/:itemId/status", itemsController.changeStatus);

module.exports = router;
