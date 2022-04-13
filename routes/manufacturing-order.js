/**
 * Author: Mansi Gevariya
 */
const {getAllManufacturingOrders, createManufacturingOrder, changeManufacturingOrderStatus, deleteManufacturingOrder} = require("../controllers/manufacturing-order-controller");
const router = require("express").Router();
const { body } = require("express-validator");
const {authenticateToken} = require("../middleware/authenticate-token");

router.get('/manufacturing-orders', authenticateToken, getAllManufacturingOrders);

router.post('/manufacturing-order', [
  body("orderNumber", "Order Number is required").notEmpty().trim(),
  body("totalPrice", "Total Price is required").notEmpty().trim(),
  body("selectedFoodItems", "Food Items are required").isArray().custom((value) => {
    return value.length > 0
  })
], authenticateToken, createManufacturingOrder)

router.put('/change-manufacturing-order-status', [
  body("status", "Status is required").notEmpty().trim(),
  body("order.orderNumber", "Order Number is required").notEmpty().trim(),
  body("order.food_items", "Food Items are required").isArray().custom((value) => {
    return value.length > 0
  })
], authenticateToken, changeManufacturingOrderStatus)

router.delete('/manufacturing-order/:orderNumber', authenticateToken, deleteManufacturingOrder)

module.exports = router