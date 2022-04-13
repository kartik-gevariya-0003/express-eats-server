/**
 * Author: Mansi Gevariya
 */
const {validationResult} = require("express-validator");
const {ManufacturingOrder, FoodItem, RawMaterial, RawMaterialInventory, FoodItemInventory} = require("../database/database-connection");

const MANUFACTURING_ORDER_STATUS = {
  OPEN: 'OPEN',
  PREPPING: 'PREPPING',
  PACKAGED: 'PACKAGED',
  ARCHIVED: 'ARCHIVED'
}

/**
 * This function is used to get all the manufacturing order of the logged in user from the system
 * */
getAllManufacturingOrders = async (request, response, callback) => {
  try {
    ManufacturingOrder.findAll({
      where: {
        userId: request.user.id
      },
      include: [
        {model: FoodItem, attributes: ['foodItemName', 'id']}
      ]
    }).then((manufacturingOrders) => {
      return response.status(200).json({
        message: "Manufacturing Orders retrieved.",
        success: true,
        manufacturingOrders: manufacturingOrders,
      });
    });
  } catch (error) {
    console.log(error)
    callback(error)
  }
}

/**
 * This function is used to create a manufacturing order for the logged in user of the system
 * */
createManufacturingOrder = async (request, response, callback) => {
  let data = request.body
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400).json({message: errors.array()[0].msg});
  }
  try {
    const manufacturingOrder = await ManufacturingOrder.create({
      orderNumber: data.orderNumber,
      totalPrice: data.totalPrice,
      status: MANUFACTURING_ORDER_STATUS.OPEN,
      userId: request.user.id
    })

    for (const foodItem of data['selectedFoodItems']) {
      let foodItemDetail = await FoodItem.findOne({
        where: {id: foodItem.id, userId: request.user.id}
      })
      await manufacturingOrder.addFood_item(foodItemDetail, {
        through: {quantity: foodItem.quantity}
      })
    }
    return response.status(200).json({
      message: "Manufacturing Order added successfully.",
      success: true,
    });
  } catch (error) {
    console.log(error)
    callback(error)
  }
}

/**
 * This function is used to change the status of a manufacturing order of the logged in user from the system.
 * It is also decrement raw material inventory when the status of the order is changed to 'PREPPING' and
 * increment the food item inventory when the status of the order is changed to 'PACKAGED' based on the quantities.
 * */
changeManufacturingOrderStatus = async (request, response, callback) => {
  let data = request.body
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400).json({message: errors.array()[0].msg});
  }
  try {
    let foodItems = data.order['food_items']
    for(let foodItem of foodItems) {
      let selectedFoodItem = await FoodItem.findOne({ where: { id: foodItem.id, userId: request.user.id }, include: RawMaterial })
      if (data.status === MANUFACTURING_ORDER_STATUS.PREPPING) {
        for(const rawMaterial of selectedFoodItem['raw_materials']) {
          let existingRawMaterial = await RawMaterialInventory.findOne({where: {rawMaterialId: rawMaterial.id}})
          if (existingRawMaterial) {
            let rawMaterialQuantityNeeded = Number(foodItem['manufacturing_order_food_item'].quantity) * Number(rawMaterial['food_item_raw_materials'].quantity);
            if (existingRawMaterial.quantity >= rawMaterialQuantityNeeded) {
              await RawMaterialInventory.decrement('quantity', {
                by: rawMaterialQuantityNeeded,
                where: {rawMaterialId: rawMaterial.id, userId: request.user.id}
              })
            } else {
              return response.status(412).json({
                message: "Raw Material does not exist in the inventory",
                success: true,
              });
            }
          } else {
            return response.status(412).json({
              message: "Raw Material does not exist in the inventory",
              success: true,
            });
          }
        }
      } else if (data.status === MANUFACTURING_ORDER_STATUS.PACKAGED) {
        let existingFoodItem = await FoodItemInventory.findOne({where: {foodItemId: foodItem.id, userId: request.user.id}})
        if(existingFoodItem) {
          await FoodItemInventory.increment('quantity', {
            by: Number(foodItem['manufacturing_order_food_item'].quantity),
            where: {foodItemId: foodItem.id, userId: request.user.id}
          });
        } else {
          await FoodItemInventory.create({
            quantity: Number(foodItem['manufacturing_order_food_item'].quantity),
            foodItemId: foodItem.id,
            userId: request.user.id
          })
        }
      }
    }
    await ManufacturingOrder.update({
      status: data.status,
    }, {where: {orderNumber: data.order.orderNumber}});

    return response.status(200).json({
      message: "Manufacturing Order status changed to " + data.status,
      success: true,
    });
  } catch (error) {
    console.log(error)
    callback(error)
  }
}

/**
 * This function is used to delete an OPEN manufacturing order of the logged in user from the system
 * */
deleteManufacturingOrder = async (request, response, callback) => {
  let orderNumber = request.params.orderNumber;
  if (!orderNumber) {
    return response.status(400).json({message: "Bad request: Order Number is required"});
  }
  try {
    const manufacturingOrder = await ManufacturingOrder.findOne({where: {orderNumber: orderNumber, userId: request.user.id}});
    if (!manufacturingOrder) {
      return response.status(404).json({
        message: "The manufacturing order with this order number does not exist.",
        success: true,
      });
    }
    if (manufacturingOrder.status === MANUFACTURING_ORDER_STATUS.OPEN) {
      await ManufacturingOrder.destroy({where: {orderNumber: orderNumber}})
      return response.status(200).json({
        message: "Manufacturing Order deleted successfully.",
        success: true,
      });
    } else {
      return response.status(412).json({
        message: "This manufacturing order cannot be deleted",
        success: true,
      });
    }
  } catch (error) {
    console.log(error)
    callback(error)
  }
}

module.exports = {
  getAllManufacturingOrders,
  createManufacturingOrder,
  changeManufacturingOrderStatus,
  deleteManufacturingOrder
}