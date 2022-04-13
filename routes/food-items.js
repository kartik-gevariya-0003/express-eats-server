// Author: Tasneem Yusuf Porbanderwala
const router = require("express").Router();
const { body } = require("express-validator");
const {
  getAllFoodItems,
  addFoodItem,
  getFoodItemByName,
  updateFoodItemWithImage,
  updateFoodItem,
  getFoodItemById,
  deleteFoodItem,
} = require("../controllers/food-items-controller");
const { authenticateToken } = require("../middleware/authenticate-token");
const upload = require("../middleware/food-item-image-upload");

router.get("/get-food-items", authenticateToken, getAllFoodItems);
router.post(
  "/add-food-item",
  authenticateToken,
  upload.single("imageFile"),
  [
    body("foodItemName", "Food Item name is required").notEmpty(),
    body("totalCost", "Total Cost is required").notEmpty(),
    body("imageFileName", "Image file name is required").notEmpty(),
  ],
  addFoodItem
);
router.get(
  "/get-food-item-name/:foodItemName",
  authenticateToken,
  getFoodItemByName
);
router.get("/get-food-item-by-id/:id", authenticateToken, getFoodItemById);
router.put(
  "/update-food-item",
  [
    body("foodItemName", "Food Item name is required").notEmpty(),
    body("totalCost", "Total Cost is required").notEmpty(),
  ],
  authenticateToken,
  updateFoodItem
);
router.put(
  "/update-food-item-with-image",
  authenticateToken,
  upload.single("imageFile"),
  [
    body("foodItemName", "Food Item name is required").notEmpty(),
    body("totalCost", "Total Cost is required").notEmpty(),
    body("imageFileName", "Image file name is required").notEmpty(),
  ],
  updateFoodItemWithImage
);
router.delete("/delete-food-item/:id", authenticateToken, deleteFoodItem);
module.exports = router;
