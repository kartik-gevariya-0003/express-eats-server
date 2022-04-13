// Author: Tasneem Yusuf Porbanderwala
module.exports = (sequelize, Sequelize) => {
  const FoodItem = sequelize.define("food_items", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    foodItemName: Sequelize.STRING,
    totalCost: Sequelize.FLOAT,
    manufacturerCost: Sequelize.FLOAT,
    profitMargin: Sequelize.FLOAT,
    imageFile: Sequelize.BLOB("long"),
    imageFileName: Sequelize.STRING,
  });
  return FoodItem;
};
