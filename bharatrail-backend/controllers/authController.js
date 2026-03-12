const authService = require("../services/authService");

function serializeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone_number: user.phone_number
  };
}

async function register(req, res) {
  const { user, token } = await authService.registerUser(req.body);

  res.status(201).json({
    success: true,
    message: "User registered successfully.",
    data: {
      token,
      user: serializeUser(user)
    }
  });
}

async function login(req, res) {
  const { user, token } = await authService.loginUser(req.body);

  res.json({
    success: true,
    message: "Login successful.",
    data: {
      token,
      user: serializeUser(user)
    }
  });
}

module.exports = {
  register,
  login
};
