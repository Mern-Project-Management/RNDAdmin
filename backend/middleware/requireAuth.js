const jwt = require("jsonwebtoken");

const requireAuth = async (req, res, next) => {
  try {
    let token = req.cookies ? req.cookies.jwt : null;

    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      console.log("Unauthorized user: No token provided");
      return res.status(403).json({ message: "Unauthenticated user: No token provided" });
    }

    // Decode the token using the secret
    const decodedToken = await jwt.verify(token, "secret");

    if (!decodedToken.id) {
      console.log("Token doesn't contain a valid user ID");
      return res.status(403).json({ message: "Invalid token structure" });
    }

    // Attach the user ID to the request object
    req.newAdmin = decodedToken.id;

    next();
  } catch (err) {
    console.log("Error verifying token:", err.message);
    res.status(403).json({ message: "Forbidden: Invalid or missing token" });
  }
};

module.exports = { requireAuth };
