/**
 * Author: Kartik Gevariya
 */
module.exports = (sequelize, Sequelize) => {
  return sequelize.define(
    "users",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      firstName: Sequelize.STRING,
      lastName: Sequelize.STRING,
      email: Sequelize.STRING,
      password: Sequelize.STRING
    },
    {
      timestamps: false,
    }
  );
};
