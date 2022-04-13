// Author: Tasneem Yusuf Porbanderwala
module.exports = (sequelize, Sequelize) => {
  return sequelize.define("food_item_raw_materials", {
    quantity: Sequelize.INTEGER,
  });
};
