const { composer } = require("googleapis/build/src/apis/composer");
const { verifyToken } = require("../utils/jwt-utils");

const authenticate = async (token) => {
  try {
    const tokenData = await verifyToken(token);
    if (tokenData) {
      return tokenData;
    } else {
      return false;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
};

const validateTokenData = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      const data = await authenticate(token);
      if (data) {
        req.user = data;
      } else {
        console.log("user does't exist");

        res.status(400).json({ message: "user does not exist" });
      }
    } else {
      console.log("token not sent");
    }

    next();
  } catch (err) {
    console.log(err);
  }
};

module.exports = { validateTokenData };
