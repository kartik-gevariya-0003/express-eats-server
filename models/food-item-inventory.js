/*
Author: Mansi Gevariya
* */
module.exports = (sequelize, Sequelize) => {
  return sequelize.define("food_item_inventory", {
    quantity: {
      type: Sequelize.INTEGER,
      allowNull: false
    }
  })
};