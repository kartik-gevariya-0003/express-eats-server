/**
 * Author: Mansi Gevariya
 */
module.exports = (sequelize, Sequelize) => {
  return sequelize.define("manufacturing_orders", {
    orderNumber: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    totalPrice: {
      type: Sequelize.DECIMAL(10, 4),
      allowNull: false
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false
    }
  })
};