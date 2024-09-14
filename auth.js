const jwt = require("jsonwebtoken");
const JWT_SECRET = "s3cret";

function auth(req, res, next) {
  const token = req.headers.token;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(403).json({
      message: "Invalid token",
    });
  }
}

module.exports = {
  auth,
  JWT_SECRET,
};
