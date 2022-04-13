/**
 * Author: Kartik Gevariya, Rotesh Chhabra
 */
const router = require("express").Router();
const { body } = require("express-validator");
const { authenticateToken } = require("../middleware/authenticate-token");
const {
  getAllVendors,
  addVendor,
  editVendor,
  deleteVendor,
  getVendorById,
} = require("../controllers/vendor-controller");

router.get("/vendors", authenticateToken, getAllVendors);
router.post("/vendor", authenticateToken, addVendor);
router.put("/vendor", authenticateToken, editVendor);
router.delete("/vendor/:id", authenticateToken, deleteVendor);
router.get("/vendor/:id", authenticateToken, getVendorById);

module.exports = router;
