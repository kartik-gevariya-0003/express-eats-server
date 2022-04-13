/**
 * Author: Kartik Gevariya
 */
module.exports = (sequelize, Sequelize) => {
  return sequelize.define(
    "purchase_order_raw_materials",
    {
      quantity: Sequelize.DOUBLE
    },
    {
      timestamps: true,
    }
  );
};
