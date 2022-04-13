/*
Author: Mansi Gevariya
* */
module.exports = (sequelize, Sequelize) => {
  return sequelize.define("raw_material_inventory", {
    quantity: {
      type: Sequelize.INTEGER,
      allowNull: false
    }
  })
};