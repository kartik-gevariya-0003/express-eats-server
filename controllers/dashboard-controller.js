const sequelize = require("sequelize");
const {
  RawMaterial,
  RawMaterialInventory,
  FoodItem,
  FoodItemInventory,
  PurchaseOrder,
  ManufacturingOrder
} = require("../database/database-connection");

getLowInventory = async (request, response, callback) => {
  let userId = request.user.id;
  try {
    const rawMaterialInventory = await RawMaterialInventory.findAll({
      where: {userId: userId},
      order: [['quantity', 'ASC']],
      include: [{model: RawMaterial}],
      limit: 2
    })
    return response.status(200).json({
      message: "Raw materials low in inventory retrieved.",
      success: true,
      lowInventory: rawMaterialInventory,
    });
  } catch (error) {
    console.log(error)
    callback(error)
  }
}

getTotalRawMaterialsInInventory = async (request, response, callback) => {
  let userId = request.user.id;
  try {
    const totalRawMaterialInInventory = await RawMaterialInventory.findAll({
      where: {userId: userId},
      attributes: [[sequelize.fn('sum', sequelize.col('quantity')), 'totalQuantity']]
    })
    return response.status(200).json({
      message: "Total raw materials in inventory retrieved.",
      success: true,
      totalRawMaterialsInInventory: totalRawMaterialInInventory[0].getDataValue('totalQuantity'),
    });
  } catch (error) {
    console.log(error)
    callback(error)
  }
}

getTotalFoodItemsInInventory = async (request, response, callback) => {
  let userId = request.user.id;
  try {
    const totalFoodItemsInInventory = await FoodItemInventory.findAll({
      where: {userId: userId},
      attributes: [[sequelize.fn('sum', sequelize.col('quantity')), 'totalQuantity']]
    })
    return response.status(200).json({
      message: "Total food items in inventory retrieved.",
      success: true,
      totalFoodItemsInInventory: totalFoodItemsInInventory[0].getDataValue('totalQuantity'),
    });
  } catch (error) {
    console.log(error)
    callback(error)
  }
}

getTotalExpenditure = async (request, response, callback) => {
  let userId = request.user.id;
  try {
    const totalPurchaseOrderAmount = await PurchaseOrder.findAll({
      where: {userId: userId},
      attributes: [[sequelize.fn('sum', sequelize.col('totalCost')), 'totalCost']]
    })
    const manufacturingFoodItems = await ManufacturingOrder.findAll({
      where: {userId: userId},
      include: [{model: FoodItem, attributes: ['manufacturerCost']}]
    })
    let totalCostOfManufacturing = 0;
    for (let foodItem of manufacturingFoodItems) {
      let foodItemQuantity = foodItem['food_items'][0].manufacturing_order_food_item.getDataValue('quantity');
      totalCostOfManufacturing += (foodItem['food_items'][0].getDataValue('manufacturerCost') * foodItemQuantity);
    }
    const totalCostOfPurchase = totalPurchaseOrderAmount[0].getDataValue('totalCost')
    const totalExpenditure = totalCostOfManufacturing + totalCostOfPurchase;
    return response.status(200).json({
      message: "Total expenditure retrieved.",
      success: true,
      totalExpenditure: totalExpenditure,
    });
  } catch (error) {
    console.log(error)
    callback(error)
  }
}

getExpectedRevenue = async (request, response, callback) => {
  let userId = request.user.id;
  try {
    const manufacturingFoodItems = await ManufacturingOrder.findAll({
      where: {userId: userId},
      include: [{model: FoodItem, attributes: ['profitMargin', 'totalCost']}]
    })
    let expectedRevenue = 0;
    for (let foodItem of manufacturingFoodItems) {
      let foodItemQuantity = foodItem['food_items'][0].manufacturing_order_food_item.getDataValue('quantity');
      let foodItemCost = foodItem['food_items'][0].getDataValue('totalCost');
      let foodItemProfitMargin = foodItem['food_items'][0].getDataValue('profitMargin')
      expectedRevenue += ((foodItemCost * foodItemProfitMargin) / 100) * foodItemQuantity;
    }
    return response.status(200).json({
      message: "Expected revenue retrieved.",
      success: true,
      expectedRevenue: expectedRevenue,
    });
  } catch (error) {
    console.log(error)
    callback(error)
  }
}

getMostUsedRawMaterials = async (request, response, callback) => {
  const {Op} = require('sequelize');
  let userId = request.user.id;
  let range = request.params.range
  try {
    let manufacturingOrders = [];
    let startDate = new Date().setDate(new Date().getDate() - 1);
    let endDate = new Date()
    if (range === '1w') {
      startDate = new Date().setDate(new Date().getDate() - 6);
    } else if (range === '1m') {
      startDate = new Date().setMonth(new Date().getMonth() - 1);
    } else if (range === '6m') {
      startDate = new Date().setMonth(new Date().getMonth() - 6);
    } else if (range === '1y') {
      startDate = new Date().setFullYear(new Date().getFullYear() - 1);
    }
    manufacturingOrders = await ManufacturingOrder.findAll({
      where: {
        userId: userId,
        createdAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate
        },
      },
      include: [{model: FoodItem, attributes: ['foodItemName', 'id']}],
    })
    const rawMaterialsUsed = [];
    for (const manufacturingOrder of manufacturingOrders) {
      for (const foodItem of manufacturingOrder['food_items']) {
        const foodItemDetails = await FoodItem.findOne({
          where: {id: foodItem.id},
          attributes: ['id'],
          include: [{model: RawMaterial, attributes: ['rawMaterialName', 'id']}]
        })
        for (const rawMaterial of foodItemDetails['raw_materials']) {
          let index = rawMaterialsUsed.findIndex(rawMaterialUsed => rawMaterialUsed.name === rawMaterial.rawMaterialName);
          if (index > -1) {
            rawMaterialsUsed[index].value += rawMaterial['food_item_raw_materials'].quantity;
          } else {
            rawMaterialsUsed.push({
              name: rawMaterial.rawMaterialName,
              value: rawMaterial['food_item_raw_materials'].quantity
            })
          }
        }
      }
    }
    return response.status(200).json({
      message: "Most used raw materials retrieved.",
      success: true,
      rawMaterialsUsed: rawMaterialsUsed.slice(0, rawMaterialsUsed.length > 5 ? 6 : rawMaterialsUsed.length)
    });
  } catch (error) {
    console.log(error)
    callback(error)
  }
}

getPurchaseVsUsedRawMaterials = async (request, response, callback) => {
  const {Op} = require('sequelize');
  let userId = request.user.id;
  let range = request.params.range
  try {
    let startDate = new Date().setDate(new Date().getDate() - 1);
    let endDate = new Date()
    if (range === '1w') {
      startDate = new Date().setDate(new Date().getDate() - 6);
    } else if (range === '1m') {
      startDate = new Date().setMonth(new Date().getMonth() - 1);
    } else if (range === '6m') {
      startDate = new Date().setMonth(new Date().getMonth() - 6);
    } else if (range === '1y') {
      startDate = new Date().setFullYear(new Date().getFullYear() - 1);
    }
    let manufacturingOrders = await ManufacturingOrder.findAll({
      where: {
        userId: userId,
        status: ['OPEN', 'PREPPING'],
        createdAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate
        },
      },
      order: [['createdAt','DESC']],
      include: [{model: FoodItem, attributes: ['foodItemName', 'id']}],
    })
    let purchaseOrders = await PurchaseOrder.findAll({
      where: {
        userId: userId,
        createdAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate
        },
      },
      order: [['createdAt','DESC']],
      include: [{model: RawMaterial, attributes: ['rawMaterialName', 'id']}],
    })
    let purchasedVsUsedMaterials = []
    for (const purchaseOrder of purchaseOrders) {
      let purchaseOrderDate = new Date(purchaseOrder.createdAt).setHours(0, 0, 0)
      for (const rawMaterial of purchaseOrder['raw_materials']) {
        const index = purchasedVsUsedMaterials.findIndex(purchasedVsUsedMaterial => purchasedVsUsedMaterial.name === purchaseOrderDate);
        if (index > -1) {
          purchasedVsUsedMaterials[index].purchasedMaterials += rawMaterial['purchase_order_raw_materials'].quantity
        } else {
          purchasedVsUsedMaterials.push({
            name: purchaseOrderDate,
            purchasedMaterials: rawMaterial['purchase_order_raw_materials'].quantity,
            usedMaterials: 0
          })
        }
      }
    }
    for (const manufacturingOrder of manufacturingOrders) {
      let manufacturingOrderDate = new Date(manufacturingOrder.createdAt).setHours(0, 0, 0);
      for (const foodItem of manufacturingOrder['food_items']) {
        const foodItemDetails = await FoodItem.findOne({
          where: {id: foodItem.id},
          attributes: ['id'],
          include: [{model: RawMaterial, attributes: ['rawMaterialName', 'id']}]
        })
        for (const rawMaterial of foodItemDetails['raw_materials']) {
          const index = purchasedVsUsedMaterials.findIndex(purchasedVsUsedMaterial => purchasedVsUsedMaterial.name === manufacturingOrderDate);
          if (index > -1) {
            purchasedVsUsedMaterials[index].usedMaterials += rawMaterial['food_item_raw_materials'].quantity
          } else {
            purchasedVsUsedMaterials.push({
              name: manufacturingOrderDate,
              purchasedMaterials: 0,
              usedMaterials: rawMaterial['food_item_raw_materials'].quantity
            })
          }
        }
      }
    }
    return response.status(200).json({
      message: "Most used raw materials retrieved.",
      success: true,
      purchasedVsUsedMaterials: purchasedVsUsedMaterials
    });
  } catch (error) {
    console.log(error)
    callback(error)
  }
}

module.exports = {
  getLowInventory,
  getTotalRawMaterialsInInventory,
  getTotalFoodItemsInInventory,
  getTotalExpenditure,
  getExpectedRevenue,
  getMostUsedRawMaterials,
  getPurchaseVsUsedRawMaterials
}