// Author: Tasneem Yusuf Porbanderwala, Karishma Suresh Lalwani
module.exports = (sequelize, Sequelize) => {
  const RawMaterial = sequelize.define("raw_materials", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    rawMaterialName: Sequelize.STRING,
    unitCost: Sequelize.FLOAT,
    unitMeasurement: Sequelize.STRING,
  });
  return RawMaterial;
};
