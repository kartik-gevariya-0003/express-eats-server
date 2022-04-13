//Author: Karishma Suresh Lalwani, Kartik Gevariya
// Routing information code
const router = require('express').Router();
const {body} = require('express-validator');
const {authenticateToken} = require("../middleware/authenticate-token");
const {createRawMaterial, getRawMaterials, editRawMaterial, deleteRawMaterial, getRawMaterialById} = require('../controllers/raw-material-controller');

router.post('/raw-material', [
    body("rawMaterialName", "Raw Material name is required").notEmpty().trim(),
    body("vendorIds", "Vendor ID is required").isArray().custom((value) => {
            return value.length > 0
        }),
    body("unitCost", "Unit cost is required").notEmpty().trim(),
    body("unitMeasurement", "Unit measurement is required").notEmpty().trim()]
    ,authenticateToken, createRawMaterial);

router.get('/raw-materials',authenticateToken, getRawMaterials);
router.get('/raw-material/:id',authenticateToken, getRawMaterialById);
router.put('/raw-material',[
    body("rawMaterialName", "Raw Material name is required").notEmpty().trim(),
    body("vendorIds", "Vendor ID is required").isArray().custom((value) => {
        return value.length > 0
    }),
    body("unitCost", "Unit cost is required").notEmpty().trim(),
    body("unitMeasurement", "Unit measurement is required").notEmpty().trim()],
    authenticateToken, editRawMaterial);
router.delete('/raw-material/:id',authenticateToken, deleteRawMaterial);

module.exports = router;