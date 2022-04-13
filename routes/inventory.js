// Author: Tasneem Yusuf Porbanderwala
const router = require("express").Router();
const { body } = require("express-validator");
const {
  getAllInventoryItems,
  addFoodItemInventory,
  addRawMaterialInventory,
} = require("../controllers/inventory-controller");
const { authenticateToken } = require("../middleware/authenticate-token");

router.get("/get-all-inventory-items", authenticateToken, getAllInventoryItems);
router.post(
  "/add-food-item-inventory",
  authenticateToken,
  addFoodItemInventory
);
router.post(
  "/add-raw-material-inventory",
  authenticateToken,
  addRawMaterialInventory
);
module.exports = router;
