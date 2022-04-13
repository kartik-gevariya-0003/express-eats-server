const {
  getLowInventory,
  getTotalRawMaterialsInInventory,
  getTotalFoodItemsInInventory,
  getTotalExpenditure,
  getExpectedRevenue,
  getMostUsedRawMaterials,
  getPurchaseVsUsedRawMaterials
} = require("../controllers/dashboard-controller");
const {authenticateToken} = require("../middleware/authenticate-token");
const router = require("express").Router();

router.get('/low-inventory', authenticateToken, getLowInventory);
router.get('/total-raw-materials-in-inventory', authenticateToken, getTotalRawMaterialsInInventory);
router.get('/total-food-items-in-inventory', authenticateToken, getTotalFoodItemsInInventory);
router.get('/total-expenditure', authenticateToken, getTotalExpenditure);
router.get('/expected-revenue', authenticateToken, getExpectedRevenue);
router.get('/most-used-raw-materials/:range', authenticateToken, getMostUsedRawMaterials);
router.get('/purchased-vs-used-raw-materials/:range', authenticateToken, getPurchaseVsUsedRawMaterials);

module.exports = router
