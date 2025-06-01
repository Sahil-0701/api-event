import jwt from "jsonwebtoken";
import adminModel from "../models/adminModel.js";
import userModel from "../models/userModel.js";

const protect = async (req, res, next) => {
  try {
    let token;

    console.log("Request headers:", req.headers);
    console.log("Authorization header:", req.headers.authorization);

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
      console.log("Extracted token:", token);
    }

    if (!token) {
      console.log("No token found in request");
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token",
        headers: req.headers,
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token:", decoded);

      const admin = await adminModel.findById(decoded.id).select("-password");
      if (admin) {
        console.log("Found admin user:", admin._id);
        req.user = admin;
        req.user.role = "admin";
        return next();
      }

      const user = await userModel.findById(decoded.id).select("-password");
      if (user) {
        console.log("Found regular user:", user._id);
        req.user = user;
        req.user.role = "user";
        return next();
      }

      console.log("No user found for token");
      return res.status(401).json({
        success: false,
        message: "Not authorized, user not found",
        decodedToken: decoded,
      });
    } catch (error) {
      console.error("Token verification error:", error);
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed",
        error: error.message,
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack,
    });
  }
};

export default protect;
