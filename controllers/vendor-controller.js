/**
 * Author: Rotesh Chhabra
 */
const {validationResult} = require("express-validator");
const {Vendor} = require("../database/database-connection");

// Logic for getting all vendors
const getAllVendors = async (request, response, callback) => {
  try {
    await Vendor.findAll({
      where: {
        userId: request.user.id
      }
    }).then((vendors) => {
      return response.status(200).json({
        message: "Vendors retrieved.",
        success: true,
        vendors: vendors
      });
    });
  } catch (error) {
    console.log(error);
    return response.status(500, {
      message: "Internal Server Error!"
    });
  }
};

// Logic for adding a new vendor
const addVendor = async (request, response) => {
  let data = request.body;
  try {
    const vendor = await Vendor.create({
      vendorName: data.vendorName,
      contactPersonName: data.contactPersonName,
      address: data.address,
      email: data.email,
      contactNumber: data.contactNumber,
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

// Logic for deleting a vendor
const deleteVendor = async (request, response) => {
  const id = request.params.id;
  try {
    Vendor.destroy({where: {id}})
      .then((res) => {
        if (res > 0) {
          response.status(200).json({
            success: true,
            message: "Vendor deleted successfully."
          });
        } else {
          return response.status(404).json({
            success: false,
            message: "No vendor with the given id found."
          });
        }
      })
      .catch((error) => {
        console.error(error);
      });
  } catch (error) {
    return response.status(500).json({
      message: "Error, cannot delete vendor",
      success: false
    });
  }
};

// Logic for editing a vendor
const editVendor = async (request, response) => {
  let data = request.body;
  try {
    if (!data || Object.keys(data).length === 0) {
      return response.status(400).json({
        success: false,
        message: "No values exist to update"
      });
    } else {
      await Vendor.update(
        {
          vendorName: data.vendorName,
          contactPersonName: data.contactPersonName,
          address: data.address,
          email: data.email,
          contactNumber: data.contactNumber
        },
        {where: {id: data.id}}
      );

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

// Logic to get a single vendor
const getVendorById = async (request, response) => {
  const vendorId = request.params.id;
  try {
    Vendor.findOne({
      where: {id: vendorId, userId: request.user.id}
    }).then((result) => {
      if (result !== null) {
        return response.status(200).json({
          success: true,
          message: "Vendor retrieved.",
          vendor: result
        });
      } else {
        return response.status(404).json({
          success: false,
          message: "Vendor does not exist."
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
  getAllVendors,
  addVendor,
  editVendor,
  deleteVendor,
  getVendorById
};
