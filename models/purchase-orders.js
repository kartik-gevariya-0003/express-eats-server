/**
 * Author: Kartik Gevariya
 */
module.exports = (sequelize, Sequelize) => {
  return  sequelize.define(
    "purchase_orders",
    {
      orderNumber: {
        type: Sequelize.STRING,
        primaryKey: true,
      },
      totalCost: Sequelize.DOUBLE,
      status: {
        type: Sequelize.STRING,
        defaultValue: 'OPEN'
      }
    },
    {
      timestamps: true,
    }
  );
};
