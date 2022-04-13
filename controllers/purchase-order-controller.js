/**
 * Author: Kartik Gevariya
 */
const { validationResult } = require("express-validator");
const { Vendor, RawMaterial, PurchaseOrder, RawMaterialInventory } = require("../database/database-connection");

/**
 * This function is responsible for getting all purchased orders for logged in user.
 */
const getAllPurchaseOrders = async (request, response, callback) => {
  const errors = validationResult(request);

  if (!errors.isEmpty()) {
    return response.status(400).json({ message: errors.array()[0].msg });
  }

  try {
    return response.status(200).json({
      message: "All purchase orders retrieved.",
      success: true,
      purchaseOrders: await PurchaseOrder.findAll({
          where: {
            userId: request.user.id
          },
          include: [
            {model: Vendor},
            {model: RawMaterial}
          ]
        }
      ),
    });
  } catch (error) {
    callback(error);
  }
};

/**
 * This function is responsible for creating a new purchase order with provided details.
 */
const addPurchaseOrder = async (request, response, callback) => {
  let data = request.body;

  const errors = validationResult(request);

  if (!errors.isEmpty()) {
    return response.status(400).json({ message: errors.array()[0].msg });
  }

  try {
    const purchaseOrder = await PurchaseOrder.create({
      orderNumber: data.orderNumber,
      totalCost: data.totalCost,
      vendorId: data.vendorId,
      userId: request.user.id
    });

    for (const rawMaterial of data.selectedRawMaterials) {
      let rawMaterialDetail = await RawMaterial.findOne({
        where: { id: rawMaterial.id },
      });

      await purchaseOrder.addRaw_material(rawMaterialDetail, {
        through: { quantity: rawMaterial.quantity }
      });
    }

    return response.status(200).json({
      message: "Purchase Order added successfully.",
      success: true,
    });
  } catch (error) {
    console.log(error);
    callback(error);
  }
};

/**
 * This function is responsible for deleting a purchase order.
 */
const deletePurchaseOrder = async (request, response, callback) => {
  let orderNumber;
  if (request.params && request.params.id) {
    orderNumber = request.params.id;
  } else {
    return response.status(400).json({
      message: 'Please provide valid order number.',
      success: false
    });
  }

  try {
    await PurchaseOrder.destroy({
      where: {
        orderNumber: orderNumber
      }
    });

    return response.status(200).json({
      message: "Purchase Order deleted successfully.",
      success: true,
    });
  } catch (error) {
    console.log(error);
    callback(error);
  }
};

/**
 * This function is responsible for changing order status to PLACED.
 */
const placePurchaseOrder = async (request, response, callback) => {
  let orderNumber;
  if (request.params && request.params.id) {
    orderNumber = request.params.id;
  } else {
    return response.status(400).json({
      message: 'Please provide valid order number.',
      success: false
    });
  }

  try {
    await PurchaseOrder.update({status: 'PLACED'}, {
      where: {
        orderNumber: orderNumber
      }
    });

    return response.status(200).json({
      message: "Purchase Order status updated successfully.",
      success: true,
    });
  } catch (error) {
    console.log(error);
    callback(error);
  }
};

/**
 * This function is responsible for changing order status to RECEIVED.
 * Once order status is changed to RECEIVED, all purchased raw materials will be added to respective inventory.
 */
const receivePurchaseOrder = async (request, response, callback) => {
  let orderNumber;
  if (request.params && request.params.id) {
    orderNumber = request.params.id;
  } else {
    return response.status(400).json({
      message: 'Please provide valid order number.',
      success: false
    });
  }

  try {
    await PurchaseOrder.update({status: 'RECEIVED'}, {
      where: {
        orderNumber: orderNumber
      }
    });

    let purchaseOrderDetail = await PurchaseOrder.findByPk(orderNumber, {
      include: [
        {model: RawMaterial}
      ]
    });

    console.log(JSON.stringify(purchaseOrderDetail.raw_materials));
    for (const rawMaterial of purchaseOrderDetail.raw_materials) {
      console.log(JSON.stringify(rawMaterial));
      console.log(rawMaterial.rawMaterialName + ' update started');
      await RawMaterialInventory.increment('quantity', {by: rawMaterial.purchase_order_raw_materials.quantity,
        where: {
          rawMaterialId: rawMaterial.id
        }
      });
      console.log(rawMaterial.rawMaterialName + ' update completed');
    }

    return response.status(200).json({
      message: "Purchase Order status updated successfully.",
      success: true,
    });
  } catch (error) {
    console.log(error);
    callback(error);
  }
};

/**
 * This function is responsible for changing order status to ARCHIVED.
 */
const archivePurchaseOrder = async (request, response, callback) => {
  let orderNumber;
  if (request.params && request.params.id) {
    orderNumber = request.params.id;
  } else {
    return response.status(400).json({
      message: 'Please provide valid order number.',
      success: false
    });
  }

  try {
    await PurchaseOrder.update({status: 'ARCHIVED'}, {
      where: {
        orderNumber: orderNumber
      }
    });

    return response.status(200).json({
      message: "Purchase Order status updated successfully.",
      success: true,
    });
  } catch (error) {
    console.log(error);
    callback(error);
  }
};

module.exports = { getAllPurchaseOrders, addPurchaseOrder, deletePurchaseOrder, placePurchaseOrder, receivePurchaseOrder, archivePurchaseOrder };
