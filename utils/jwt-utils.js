const verifyToken = (token) => {
  try {
    const resJwt = jwt.verify(token, "hello");
    if (resJwt) {
      return resJwt;
    } else {
      return false;
    }
  } catch (err) {
    console.log(err.message);
    // throw Error('Authentication Error : ' + err.message);
    return false;
  }
};

module.exports = { verifyToken };
