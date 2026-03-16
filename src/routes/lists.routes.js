const express = require("express");
const router = express.Router();
const listsController = require("../controllers/lists.controller");

router.get("/", listsController.getLists);
router.get("/:id", listsController.getList);
router.post("/", listsController.createList);
router.put("/:id", listsController.updateList);
router.delete("/:id", listsController.deleteList);

module.exports = router;
