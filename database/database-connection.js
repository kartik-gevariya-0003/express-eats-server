/**
 * Author: Karishma Suresh Lalwani
 * Author: Kartik Gevariya
 * Author: Mansi Gevariya
 * Author: Rotesh Chhabra
 * Author: Tasneem Yusuf Porbanderwala
 */
const { Sequelize } = require("sequelize");
const userModel = require("../models/users");
const vendorModel = require("../models/vendors");
const foodItemModel = require("../models/food-items");
const rawMaterialModel = require("../models/raw-materials");
const foodItemRawMaterialModel = require("../models/food-item-raw-materials");
const manufacturingOrderModel = require("../models/manufacturing-orders");
const manufacturingOrderFoodItemModel = require("../models/manufacturing-order-food-item");
const foodItemInventoryModel = require("../models/food-item-inventory");
const rawMaterialInventoryModel = require("../models/raw-material-inventory");
const purchaseOrderModel = require("../models/purchase-orders");
const purchaseOrderRawMaterialModel = require("../models/purchase-order-raw-materials");
const vendorRawMaterialModel = require("../models/vendor-raw-material");

require("dotenv").config();
const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USERNAME,
  process.env.DATABASE_PASSWORD,
  {
    host: process.env.DATABASE_HOST,
    dialect: "mysql"
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection made successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

const User = userModel(sequelize, Sequelize);
const Vendor = vendorModel(sequelize, Sequelize);
const FoodItem = foodItemModel(sequelize, Sequelize);
const RawMaterial = rawMaterialModel(sequelize, Sequelize);
const FoodItemRawMaterial = foodItemRawMaterialModel(sequelize, Sequelize);
const PurchaseOrder = purchaseOrderModel(sequelize, Sequelize);
const PurchaseOrderRawMaterial = purchaseOrderRawMaterialModel(
  sequelize,
  Sequelize
);
const ManufacturingOrder = manufacturingOrderModel(sequelize, Sequelize);
const ManufacturingOrderFoodItem = manufacturingOrderFoodItemModel(
  sequelize,
  Sequelize
);
const FoodItemInventory = foodItemInventoryModel(sequelize, Sequelize);
const RawMaterialInventory = rawMaterialInventoryModel(sequelize, Sequelize);
const VendorRawMaterial = vendorRawMaterialModel(sequelize, Sequelize);

Vendor.belongsTo(User);
RawMaterial.belongsTo(User);
FoodItem.belongsTo(User);
PurchaseOrder.belongsTo(User);
ManufacturingOrder.belongsTo(User);
FoodItemInventory.belongsTo(User);
RawMaterialInventory.belongsTo(User);

FoodItem.belongsToMany(RawMaterial, { through: FoodItemRawMaterial });
RawMaterial.belongsToMany(FoodItem, { through: FoodItemRawMaterial });
PurchaseOrder.belongsTo(Vendor);
RawMaterial.belongsToMany(PurchaseOrder, { through: PurchaseOrderRawMaterial });
PurchaseOrder.belongsToMany(RawMaterial, { through: PurchaseOrderRawMaterial });
FoodItem.belongsToMany(ManufacturingOrder, {
  through: ManufacturingOrderFoodItem
});
ManufacturingOrder.belongsToMany(FoodItem, {
  through: ManufacturingOrderFoodItem
});

FoodItem.hasOne(FoodItemInventory, { onDelete: "CASCADE" });
FoodItemInventory.belongsTo(FoodItem);

RawMaterial.hasOne(RawMaterialInventory, { onDelete: "CASCADE" });
RawMaterialInventory.belongsTo(RawMaterial);

Vendor.belongsToMany(RawMaterial, { through: VendorRawMaterial });
RawMaterial.belongsToMany(Vendor, { through: VendorRawMaterial });

sequelize.sync({ force: false, alter: true }).then(() => {
  console.log(`Database & tables created.`);
});

module.exports = {
  sequelize,
  User,
  Vendor,
  FoodItem,
  RawMaterial,
  FoodItemRawMaterial,
  PurchaseOrder,
  PurchaseOrderRawMaterial,
  ManufacturingOrder,
  ManufacturingOrderFoodItem,
  FoodItemInventory,
  RawMaterialInventory,
  VendorRawMaterial
};
