/**
 * Author: Rotesh Chhabra
 */
 const {validationResult} = require("express-validator");
 const {User} = require("../database/database-connection");

 
 // Logic for deleting a user
 const deleteUser = async (request, response) => {
   const id = request.params.id;
   try {
     User.destroy({where: {id: request.user.id}})
       .then((res) => {
         if (res > 0) {
           response.status(200).json({
             success: true,
             message: "User deleted successfully."
           });
         } else {
           return response.status(404).json({
             success: false,
             message: "No user with the given id found."
           });
         }
       })
       .catch((error) => {
         console.error(error);
       });
   } catch (error) {
     return response.status(500).json({
       message: "Error, cannot delete user",
       success: false
     });
   }
 };
 
 // Logic for updating user details
 const updateUser = async (request, response) => {
   let data = request.body;
   try {
     if (!data || Object.keys(data).length === 0) {
       return response.status(400).json({
         success: false,
         message: "No values exist to update"
       });
     } else {
       await User.update(
         {
           firstName: data.firstName,
           lastName: data.lastName,
           email: data.email,
         },
         {where: {id: request.user.id}}
         
       );
 
       return response.status(200).json({
         message: "User updated successfully.",
         success: true
       });
     }
   } catch (error) {
     console.log(error);
     response.status(500).json({
       message: "Server error",
       error: error.message
     });
   }
 };
 
 // Logic to get a single user
 const getUser = async (request, response) => {
   try {
     User.findOne({
       where: {id: request.user.id}
     }).then((result) => {
       if (result !== null) {
         return response.status(200).json({
           success: true,
           message: "User retrieved.",
           user: result
         });
       } else {
         return response.status(404).json({
           success: false,
           message: "User does not exist."
         });
       }
     });
   } catch (error) {
     console.error(error);
     response.status(500).json({
       message: "Server error",
       error: error.message
     });
   }
 };
 module.exports = {
    getUser,
   deleteUser,
   updateUser
 };
 