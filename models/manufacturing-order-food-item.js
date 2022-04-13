/**
 * Author: Mansi Gevariya
 */
module.exports = (sequelize, Sequelize) => {
  return sequelize.define("manufacturing_order_food_item", {
    quantity: {
      type: Sequelize.INTEGER,
      allowNull: false
    }
  })
};