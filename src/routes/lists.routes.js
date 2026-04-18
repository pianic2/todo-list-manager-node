const express = require("express");
const router = express.Router();
const listsController = require("../controllers/lists.controller");
const {
  validateListCreate,
  validateListUpdate,
  validateListId,
} = require("../middleware/validation.middleware");

router.get("/", listsController.getLists);
router.get("/:id", validateListId, listsController.getList);
router.post("/", validateListCreate, listsController.createList);
router.put("/:id", validateListId, validateListUpdate, listsController.updateList);
router.delete("/:id", validateListId, listsController.deleteList);

module.exports = router;
