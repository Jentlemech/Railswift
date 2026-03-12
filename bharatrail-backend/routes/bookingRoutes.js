const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const { authenticate, authorizeUserParam } = require("../middleware/authMiddleware");
const { validateCreateBooking } = require("../middleware/validationMiddleware");
const bookingController = require("../controllers/bookingController");

const router = express.Router();

router.use(authenticate);
router.post("/", validateCreateBooking, asyncHandler(bookingController.createBooking));
router.get("/user/:userId", authorizeUserParam, asyncHandler(bookingController.getBookingsByUser));
router.get("/:pnr", asyncHandler(bookingController.getBookingByPnr));

module.exports = router;
