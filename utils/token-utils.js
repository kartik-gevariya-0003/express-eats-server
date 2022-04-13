/**
 * Author: Kartik Gevariya
 */
const jwt = require("jsonwebtoken");

/**
 * This function is responsible for verifying provided access token.
 */
const verifyToken = async (token) => {
  if (token) {
    try {
      return await jwt.verify(token, process.env.TOKEN_SECRET);
    } catch (error) {
      return null;
    }
  }
  return null;
}

/**
 * This function is responsible for decoding access token get encrypted details stored in token.
 */
const decodeToken = (authorizationHeader) => {
  if (authorizationHeader) {
    try {
      let token = authorizationHeader.split(" ").pop() || '';
      return jwt.decode(token);
    } catch (error) {
      return null
    }
  }
  return null
}

/**
 * This function is responsible for generating access token with user details.
 * Token will be expired after 3600 seconds.
 */
const generateToken = async (userDetails) => {
  return jwt.sign(userDetails, process.env.TOKEN_SECRET, {expiresIn: '18000s'});
}

module.exports = {verifyToken, decodeToken, generateToken}