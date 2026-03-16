const express = require("express");
const router = express.Router();
const listsController = require("../controllers/lists.controller");
const { validateListCreate } = require("../middleware/validation.middleware");

router.get("/", listsController.getLists);
router.get("/:id", listsController.getList);
router.post("/", validateListCreate, listsController.createList);
router.put("/:id", listsController.updateList);
router.delete("/:id", listsController.deleteList);

module.exports = router;
