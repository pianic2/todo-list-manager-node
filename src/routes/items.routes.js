const express = require("express");
const router = express.Router();
const itemsController = require("../controllers/items.controller");
const {
  validateItemCreate,
  validateItemUpdate,
  validateItemStatusUpdate,
  validateItemListId,
  validateListItemIds,
} = require("../middleware/validation.middleware");

router.get("/:listId/items", validateItemListId, itemsController.getItems);
router.get("/:listId/items/:itemId", validateListItemIds, itemsController.getItem);
router.post("/:listId/items", validateItemListId, validateItemCreate, itemsController.createItem);
router.put("/:listId/items/:itemId", validateListItemIds, validateItemUpdate, itemsController.updateItem);
router.delete("/:listId/items/:itemId", validateListItemIds, itemsController.deleteItem);
router.patch(
  "/:listId/items/:itemId/status",
  validateListItemIds,
  validateItemStatusUpdate,
  itemsController.changeStatus
);

module.exports = router;
