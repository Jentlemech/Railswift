const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { User } = require("../models");
const { makeError } = require("../middleware/validationMiddleware");

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn
  });
}

async function registerUser(payload) {
  const email = String(payload.email).trim().toLowerCase();
  const existingUser = await User.findOne({ where: { email } });

  if (existingUser) {
    throw makeError("An account with this email already exists.", 409);
  }

  const password_hash = await bcrypt.hash(payload.password, 10);
  const user = await User.create({
    name: payload.name,
    email,
    password_hash,
    phone_number: payload.phoneNumber || null
  });

  return {
    user,
    token: signToken(user)
  };
}

async function loginUser(payload) {
  const email = String(payload.email).trim().toLowerCase();
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw makeError("Invalid email or password.", 401);
  }

  const isValid = await bcrypt.compare(payload.password, user.password_hash);
  if (!isValid) {
    throw makeError("Invalid email or password.", 401);
  }

  return {
    user,
    token: signToken(user)
  };
}

module.exports = {
  registerUser,
  loginUser
};
