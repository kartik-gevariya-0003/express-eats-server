//Author: Karishma Suresh Lalwani, Kartik Gevariya
const {
  RawMaterial,
  Vendor,
  VendorRawMaterial,
  RawMaterialInventory
} = require("../database/database-connection");

// Logic for creating a new raw material
createRawMaterial = async (request, response) => {
  let data = request.body;
  try {
    const rawMaterial = await RawMaterial.create({
      rawMaterialName: data.rawMaterialName,
      unitCost: data.unitCost,
      unitMeasurement: data.unitMeasurementValue + data.unitMeasurementCode,
      userId: request.user.id
    });
    for (const vendorId of data["vendorIds"]) {
      let vendorDetails = await Vendor.findOne({
        where: {id: vendorId}
      });
      await rawMaterial.addVendor(vendorDetails, {
        through: {vendorId: vendorId}
      });
    }

    await RawMaterialInventory.create({
      rawMaterialId: rawMaterial.id,
      quantity: 0,
      userId: request.user.id
    });

    return response.status(200).json({
      message: "Vendor added successfully.",
      success: true
    });
  } catch (error) {
    console.log(error);
    return response.status(500, {
      message: "Internal Server Error!"
    });
  }
};

// Logic for displaying all the raw materials in the system
getRawMaterials = async (request, response) => {
  try {
    await RawMaterial.findAll({
      where: {
        userId: request.user.id
      },
      include: [{model: Vendor}]
    }).then((rawMaterials) => {
      return response.status(200).json({
        message: "Raw Material retrieved.",
        success: true,
        rawMaterials: rawMaterials
      });
    });
  } catch (error) {
    console.log(error);
    return response.status(500, {
      message: "Internal Server Error!"
    });
  }
};

// Logic for deleting raw material
deleteRawMaterial = async (request, response) => {
  const id = request.params.id;
  try {
    RawMaterial.destroy({where: {id}})
      .then((res) => {
        if (res > 0) {
          response.status(200).json({
            success: true,
            message: "Raw Material deleted successfully."
          });
        } else {
          return response.status(404).json({
            success: false,
            message: "No raw material with the given id found."
          });
        }
      })
      .catch((error) => {
        console.error(error);
      });
  } catch (error) {
    return response.status(500).json({
      message: "Error, cannot delete raw material",
      success: false
    });
  }
};

// Logic for editing raw material
editRawMaterial = async (request, response) => {
  let data = request.body;
  try {
    if (!data || Object.keys(data).length === 0) {
      return response.status(400).json({
        success: false,
        message: "No values exist to update"
      });
    } else {
      await RawMaterial.update(
        {
          rawMaterialName: data.rawMaterialName,
          unitCost: data.unitCost,
          unitMeasurement: data.unitMeasurementValue + data.unitMeasurementCode
        },
        {where: {id: data.id}}
      );

      await VendorRawMaterial.destroy({
        where: {
          rawMaterialId: data.id
        }
      });

      let rawMaterialDetail = await RawMaterial.findOne({
        where: {id: data.id}
      });

      for (const vendorId of data["vendorIds"]) {
        let vendorDetails = await Vendor.findOne({
          where: {id: vendorId}
        });
        await rawMaterialDetail.addVendor(vendorDetails, {
          through: {vendorId: vendorId}
        });
      }
      return response.status(200).json({
        message: "Vendor updated successfully.",
        success: true
      });
    }
  } catch (error) {
    console.log(error);
    response.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// Logic for fetching raw material with Id
getRawMaterialById = async (request, response) => {
  const rawMaterialId = request.params.id;
  try {
    RawMaterial.findOne({
      where: {id: rawMaterialId, userId: request.user.id},
      include: Vendor
    }).then((result) => {
      if (result !== null) {
        return response.status(200).json({
          success: true,
          message: "Raw Material retrieved.",
          rawMaterial: result
        });
      } else {
        return response.status(404).json({
          success: false,
          message: "Raw Material does not exist."
        });
      }
    });
  } catch (error) {
    console.error(error);
    response.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

module.exports = {
  createRawMaterial,
  getRawMaterials,
  editRawMaterial,
  deleteRawMaterial,
  getRawMaterialById
};

module.exports = {
  createRawMaterial,
  getRawMaterials,
  editRawMaterial,
  deleteRawMaterial,
  getRawMaterialById
};
