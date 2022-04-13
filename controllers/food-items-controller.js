// Author: Tasneem Yusuf Porbanderwala
const {validationResult} = require("express-validator");
const {FoodItem, sequelize} = require("../database/database-connection");
const {RawMaterial} = require("../database/database-connection");
const fs = require("fs");
const path = require("path");

getAllFoodItems = async (request, response, callback) => {
  const errors = validationResult(request);

  if (!errors.isEmpty()) {
    return response
      .status(400)
      .json({message: errors.array()[0].msg, success: false});
  }
  try {
    FoodItem.findAll({
      where: {
        userId: request.user.id
      }
    }).then((foodItems) => {
      return response.status(200).json({
        message: "All food items retrieved.",
        success: true,
        foodItems: foodItems
      });
    });
  } catch (error) {
    callback(error);
  }
};

addFoodItem = async (request, response, callback) => {
  const errors = validationResult(request);

  if (!errors.isEmpty()) {
    return response
      .status(400)
      .json({message: errors.array()[0].msg, success: false});
  }
  let data = request.body;
  const appDir = path.dirname(require.main.filename);
  try {
    const foodItem = await FoodItem.create({
      foodItemName: data.foodItemName,
      totalCost: data.totalCost,
      manufacturerCost: data.manufacturerCost,
      profitMargin: data.profitMargin,
      imageFile: fs.readFileSync(appDir + "/temp/" + request.file.filename),
      imageFileName: data.imageFileName,
      userId: request.user.id
    });
    fs.unlinkSync(appDir + "/temp/" + request.file.filename);
    for (let selectedRawMaterial of data.selectedRawMaterials) {
      selectedRawMaterial = JSON.parse(selectedRawMaterial);
      const rawMaterial = await RawMaterial.findOne({
        where: {id: selectedRawMaterial.id}
      });

      await foodItem
        .addRaw_material(rawMaterial, {
          through: {quantity: selectedRawMaterial.quantity}
        })
    }
    await foodItem.createFood_item_inventory({
      quantity: 0,
      userId: request.user.id
    });
    return response.status(200).json({
      message: "Food Item added successfully.",
      success: true
    });
  } catch (error) {
    console.log(error);
    callback(error)
  }
};

getFoodItemByName = async (request, response, callback) => {
  const errors = validationResult(request);

  if (!errors.isEmpty()) {
    return response
      .status(400)
      .json({message: errors.array()[0].msg, success: false});
  }
  let foodItemName = request.params.foodItemName;
  try {
    FoodItem.findOne({
      where: {
        foodItemName: sequelize.where(
          sequelize.fn("lower", sequelize.col("foodItemName")),
          sequelize.fn("lower", foodItemName)
        ),
        userId: request.user.id
      }
    }).then((result) => {
      if (result !== null) {
        return response.status(200).json({
          success: true,
          message: "Food Item Name exists."
        });
      } else {
        return response.status(404).json({
          success: false,
          message: "Food Item Name does not exist."
        });
      }
    });
  } catch (error) {
    console.log(error)
    callback(error)
  }
};
getFoodItemById = async (request, response, callback) => {
  const errors = validationResult(request);

  if (!errors.isEmpty()) {
    return response
      .status(400)
      .json({message: errors.array()[0].msg, success: false});
  }
  let foodItemId = request.params.id;
  try {
    FoodItem.findOne({
      where: {id: foodItemId, userId: request.user.id},
      include: RawMaterial
    }).then((result) => {
      if (result !== null) {
        return response.status(200).json({
          success: true,
          message: "Food Item Retrieved.",
          foodItem: result
        });
      } else {
        return response.status(404).json({
          success: false,
          message: "Food Item does not exist."
        });
      }
    });
  } catch (error) {
    console.log(error)
    callback(error)
  }
};

updateFoodItemWithImage = async (request, response, callback) => {
  const errors = validationResult(request);

  if (!errors.isEmpty()) {
    return response
      .status(400)
      .json({message: errors.array()[0].msg, success: false});
  }
  let data = request.body;
  const appDir = path.dirname(require.main.filename);
  try {
    await FoodItem.update(
      {
        foodItemName: data.foodItemName,
        totalCost: data.totalCost,
        manufacturerCost: data.manufacturerCost,
        profitMargin: data.profitMargin,
        imageFile: fs.readFileSync(appDir + "/temp/" + request.file.filename),
        imageFileName: data.imageFileName
      },
      {where: {id: data.id}}
    );
    fs.unlinkSync(appDir + "/temp/" + request.file.filename);
    const foodItemInstance = FoodItem.build({id: data.id});
    const associatedRawMaterials = await foodItemInstance.getRaw_materials();
    associatedRawMaterials.forEach((associatedRawMaterial) => {
      if (
        !data.selectedRawMaterials.some(
          (item) => JSON.parse(item).id === associatedRawMaterial.id
        )
      ) {
        foodItemInstance.removeRaw_material(associatedRawMaterial);
      }
    });

    for (let selectedRawMaterial of data.selectedRawMaterials) {
      selectedRawMaterial = JSON.parse(selectedRawMaterial);
      const rawMaterial = await RawMaterial.findOne({
        where: {id: selectedRawMaterial.id}
      });
      if (!(await foodItemInstance.hasRaw_material(rawMaterial))) {
        await foodItemInstance.addRaw_material(rawMaterial, {
          through: {quantity: selectedRawMaterial.quantity}
        });
      }
    }

    return response.status(200).json({
      message: "Food Item updated successfully.",
      success: true
    });
  } catch (error) {
    console.log(error)
    callback(error)
  }
};

updateFoodItem = async (request, response, callback) => {
  const errors = validationResult(request);

  if (!errors.isEmpty()) {
    return response
      .status(400)
      .json({message: errors.array()[0].msg, success: false});
  }
  let data = request.body;
  try {
    await FoodItem.update(
      {
        foodItemName: data.foodItemName,
        totalCost: data.totalCost,
        manufacturerCost: data.manufacturerCost,
        profitMargin: data.profitMargin
      },
      {where: {id: data.id}}
    );
    const foodItemInstance = FoodItem.build({id: data.id});
    const associatedRawMaterials = await foodItemInstance.getRaw_materials();

    associatedRawMaterials.forEach((associatedRawMaterial) => {
      if (
        !data.selectedRawMaterials.some(
          (item) => item.id === associatedRawMaterial.id
        )
      ) {
        foodItemInstance.removeRaw_material(associatedRawMaterial);
      }
    });
    for (const selectedRawMaterial of data.selectedRawMaterials) {
      const rawMaterial = await RawMaterial.findOne({
        where: {id: selectedRawMaterial.id}
      });
      if (!(await foodItemInstance.hasRaw_material(rawMaterial))) {
        await foodItemInstance.addRaw_material(rawMaterial, {
          through: {quantity: selectedRawMaterial.quantity}
        });
      }
    }
    return response.status(200).json({
      message: "Food Item updated successfully.",
      success: true
    });
  } catch (error) {
    console.log(error)
    callback(error)
  }
};

deleteFoodItem = async (request, response, callback) => {
  const errors = validationResult(request);

  if (!errors.isEmpty()) {
    return response
      .status(400)
      .json({message: errors.array()[0].msg, success: false});
  }
  let id = request.params.id;
  try {
    const foodItem = await FoodItem.findOne({
      where: {id, userId: request.user.id}
    });
    if (foodItem) {
      const manufacturingOrders = await foodItem.getManufacturing_orders();

      if (manufacturingOrders.length > 0) {
        manufacturingOrders.forEach((manufacturingOrder) => {
          if (
            manufacturingOrder.status === "OPEN" &&
            manufacturingOrder.userId === request.user.id
          ) {
            return response.status(409).json({
              message: "Manufacturing Order Exists.",
              success: false
            });
          }
        });
      } else {
        await FoodItem.destroy({where: {id}})
          .then(() => {
            return response.status(200).json({
              message: "Food Item deleted successfully.",
              success: true
            });
          })
          .catch(() => {
            return response.status(400).json({
              message: "Food Item not deleted. Internal error",
              success: false
            });
          });
      }
    } else {
      return response.status(404).json({
        message: "Food Item not found",
        success: false
      });
    }
  } catch (error) {
    console.log(error)
    callback(error)
  }
};
module.exports = {
  getAllFoodItems,
  addFoodItem,
  getFoodItemByName,
  updateFoodItem,
  updateFoodItemWithImage,
  getFoodItemById,
  deleteFoodItem
};
