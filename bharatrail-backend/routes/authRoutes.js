const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const { validateRegister, validateLogin } = require("../middleware/validationMiddleware");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/register", validateRegister, asyncHandler(authController.register));
router.post("/login", validateLogin, asyncHandler(authController.login));

module.exports = router;
