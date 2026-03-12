const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { User } = require("../models");

async function authenticate(req, _res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    const error = new Error("Authorization token is required.");
    error.statusCode = 401;
    return next(error);
  }

  try {
    const payload = jwt.verify(token, env.jwt.secret);
    const user = await User.findByPk(payload.sub, {
      attributes: ["id", "name", "email", "phone_number"]
    });

    if (!user) {
      const error = new Error("Authenticated user no longer exists.");
      error.statusCode = 401;
      return next(error);
    }

    req.user = user;
    return next();
  } catch (_error) {
    const error = new Error("Invalid or expired token.");
    error.statusCode = 401;
    return next(error);
  }
}

function authorizeUserParam(req, _res, next) {
  if (!req.user || req.user.id !== req.params.userId) {
    const error = new Error("You are not allowed to access another user's bookings.");
    error.statusCode = 403;
    return next(error);
  }

  return next();
}

module.exports = {
  authenticate,
  authorizeUserParam
};
