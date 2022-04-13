/**
 * Author: Karishma Suresh Lalwani
 * Author: Kartik Gevariya
 * Author: Mansi Gevariya
 * Author: Rotesh Chhabra
 * Author: Tasneem Yusuf Porbanderwala
 */

const express = require("express");
const userRoutes = require("./routes/user");
const vendorRoutes = require("./routes/vendor");
const rawMaterialRoutes = require("./routes/raw-material");
const purchaseOrderRoutes = require("./routes/purchase-order");
const foodItemRoutes = require("./routes/food-items");
const manufacturingOrderRoutes = require("./routes/manufacturing-order");
const inventoryRoutes = require("./routes/inventory");
const dashboardRoutes = require("./routes/dashboard");
const profileRoutes = require("./routes/profile");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 3001;

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200
};

app.use(express.json());
app.use(cors(corsOptions));

app.use(userRoutes);
app.use(vendorRoutes);
app.use(rawMaterialRoutes);
app.use(purchaseOrderRoutes);
app.use(foodItemRoutes);
app.use(manufacturingOrderRoutes);
app.use(inventoryRoutes);
app.use(dashboardRoutes);
app.use(profileRoutes);
app.use(function (req, res, next) {
  res.status(404).send({
    message: "Sorry, can not find this resource.",
    success: false
  });
});

app.use((error, request, response, next) => {
  error.statusCode = error.statusCode || 500;
  error.message = error.message || "Internal Server Error";

  response.status(error.statusCode).json({
    message: error.message,
    success: false
  });
});

app.listen(port, () => console.log(`Server is running on port ${port}`));
