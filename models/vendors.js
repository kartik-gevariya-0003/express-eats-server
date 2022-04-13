/**
 * Author: Kartik Gevariya, Rotesh Chhabra
 */
module.exports = (sequelize, Sequelize) => {
  return sequelize.define(
    "vendors",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      vendorName: Sequelize.STRING,
      contactPersonName: Sequelize.STRING,
      address: Sequelize.STRING,
      email: Sequelize.STRING,
      contactNumber: Sequelize.STRING
    },
    {
      timestamps: false
    }
  );
};
