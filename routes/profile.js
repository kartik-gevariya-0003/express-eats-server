/**
 * Author: Rotesh Chhabra
 */
 const router = require("express").Router();
 const { body } = require("express-validator");
 const { authenticateToken } = require("../middleware/authenticate-token");
 const {
   getUser,
   deleteUser,
   updateUser
 } = require("../controllers/profile-controller");
 
 router.get("/profile", authenticateToken, getUser);
 router.put("/user", authenticateToken, updateUser);
 router.delete("/delete-user", authenticateToken, deleteUser);

 
 module.exports = router;
 