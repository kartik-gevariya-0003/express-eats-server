/**
 * Author: Kartik Gevariya
 */
const router = require('express').Router();
const { body } = require("express-validator");
const {authenticateToken} = require("../middleware/authenticate-token");
const {getAllPurchaseOrders, addPurchaseOrder, deletePurchaseOrder, placePurchaseOrder, receivePurchaseOrder, archivePurchaseOrder} = require('../controllers/purchase-order-controller');

router.get('/purchase-orders', authenticateToken, getAllPurchaseOrders);

router.post('/purchase-order', [
  body("orderNumber", "Order Number is required").notEmpty().trim(),
  body("totalCost", "Total Cost is required").notEmpty().trim(),
  body("vendorId", "Valid Vendor id is required").isNumeric().notEmpty().trim(),
  body("selectedRawMaterials", "Raw Materials are required").isArray().custom((value) => {
    return value.length > 0
  })
], authenticateToken, addPurchaseOrder);

router.delete('/purchase-order/:id', authenticateToken, deletePurchaseOrder);
router.post('/place-purchase-order/:id', authenticateToken, placePurchaseOrder);
router.post('/receive-purchase-order/:id', authenticateToken, receivePurchaseOrder);
router.post('/archive-purchase-order/:id', authenticateToken, archivePurchaseOrder);

module.exports = router;