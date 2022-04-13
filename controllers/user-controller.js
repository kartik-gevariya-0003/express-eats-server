/**
 * Author: Kartik Gevariya
 */
const crypto = require('crypto');
const {validationResult} = require('express-validator');
const {User} = require("../database/database-connection");
const {generateToken} = require("../utils/token-utils");

/**
 * This function is responsible for performing login based on provided credentials and generating a access token.
 */
const login = async (request, response, callback) => {
  const errors = validationResult(request);

  if (!errors.isEmpty()) {
    return response.status(400).json({
      success: false,
      message: errors.array()[0].msg
    });
  }

  try {

    let user = await User.findOne({where: {email: request.body.email}});

    if (user) {
      const md5sum = crypto.createHash('md5');
      let passwordHash = md5sum.update(request.body.password).digest('hex');
      if (user.password === passwordHash) {
        let token = await generateToken(user.toJSON());
        return response.status(200).json({
          success: true,
          message: "User logged in successfully.",
          user: {
            email: user.email,
            token: token
          }
        });
      }
    }
    return response.status(401).json({
      success: false,
      message: "Invalid username or password."
    });
  } catch (error) {
    callback(error);
  }
};

/**
 * This function is responsible for registering a new user(manufacturer) into the system.
 * Password will be encoded (through one way hashing) before storing it into the database.
 */
const register = async (request, response, callback) => {
  const errors = validationResult(request);

  if (!errors.isEmpty()) {
    return response.status(400).json({
      success: false,
      message: errors.array()[0].msg
    });
  }

  try {

    let user = await User.findOne({where: {email: request.body.email}});

    if (user) {
      return response.status(412).json({
        success: false,
        message: "Email already exists in system."
      });
    }

    const md5sum = crypto.createHash('md5');

    await User.create({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.email,
      password: md5sum.update(request.body.password).digest('hex')
    });

    return response.status(200).json({
      message: "User registered successfully.",
      success: true
    });
  } catch (error) {
    callback(error);
  }
};

module.exports = {login, register};
