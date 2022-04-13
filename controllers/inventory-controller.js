// Author: Tasneem Yusuf Porbanderwala
const {validationResult} = require("express-validator");
const {
  FoodItemInventory,
  RawMaterialInventory,
  FoodItem,
  RawMaterial
} = require("../database/database-connection");

getAllInventoryItems = async (request, response, callback) => {
  const errors = validationResult(request);

  if (!errors.isEmpty()) {
    return response.status(400).json({message: errors.array()[0].msg});
  }
  try {
    FoodItemInventory.findAll({
      where: {userId: request.user.id},
      include: FoodItem
    })
      .then((foodItemInventories) => {
        RawMaterialInventory.findAll({
          where: {userId: request.user.id},
          include: RawMaterial
        })
          .then((rawMaterialInventories) => {
            return response.status(200).json({
              message: "All inventories retrieved.",
              success: true,
              foodItemInventories,
              rawMaterialInventories
            });
          })
          .catch((error) => {
            console.log(error)
            return response.status(400).json({
              success: false,
              message: "Error in retrieving items."
            });
          });
      })
      .catch((error) => {
        console.log(error)
        return response.status(400).json({
          success: false,
          message: "Error in retrieving items."
        });
      });
  } catch (error) {
    callback(error);
  }
};

addFoodItemInventory = async (request, response, callback) => {
  const errors = validationResult(request);

  if (!errors.isEmpty()) {
    return response.status(400).json({message: errors.array()[0].msg});
  }
  let data = request.body;
  try {
    const foodItem = await FoodItem.findOne({
      where: {id: data.id, userId: request.user.id}
    });
    const inventory_entry = await foodItem.getFood_item_inventory();
    if (!inventory_entry) {
      await foodItem
        .createFood_item_inventory({
          quantity: data.quantity,
          userId: request.user.id
        })
        .then(() => {
          return response.status(200).json({
            success: true,
            message: "Food Item Inventory added."
          });
        });
    } else {
      let new_quantity =
        parseFloat(inventory_entry.quantity) + parseFloat(data.quantity);
      await FoodItemInventory.update(
        {quantity: new_quantity},
        {where: {foodItemId: foodItem.id, userId: request.user.id}}
      ).then(() => {
        return response.status(200).json({
          success: true,
          message: "Food Item Inventory updated."
        });
      });
    }
  } catch (error) {
    console.error(error);
    callback(error);
  }
};

addRawMaterialInventory = async (request, response, callback) => {
  const errors = validationResult(request);

  if (!errors.isEmpty()) {
    return response.status(400).json({message: errors.array()[0].msg});
  }
  let data = request.body;
  try {
    const rawMaterial = await RawMaterial.findOne({
      where: {rawMaterialName: data.name, userId: request.user.id}
    });
    const inventory_entry = await rawMaterial.getRaw_material_inventory();
    if (!inventory_entry) {
      await rawMaterial
        .createRaw_material_inventory({
          quantity: data.quantity,
          userId: request.user.id
        })
        .then(() => {
          return response.status(200).json({
            success: true,
            message: "Raw Material Inventory added."
          });
        });
    } else {
      let new_quantity =
        parseFloat(inventory_entry.quantity) + parseFloat(data.quantity);
      await RawMaterialInventory.update(
        {quantity: new_quantity},
        {where: {rawMaterialId: rawMaterial.id, userId: request.user.id}}
      ).then(() => {
        return response.status(200).json({
          success: true,
          message: "Raw Material Inventory updated."
        });
      });
    }
  } catch (error) {
    callback(error);
  }
};

module.exports = {
  getAllInventoryItems,
  addFoodItemInventory,
  addRawMaterialInventory
};
