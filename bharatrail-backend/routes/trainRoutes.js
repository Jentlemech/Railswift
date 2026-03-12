const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const { validateTrainSearch } = require("../middleware/validationMiddleware");
const trainController = require("../controllers/trainController");

const router = express.Router();

router.get("/", asyncHandler(trainController.listTrains));
router.get("/search", validateTrainSearch, asyncHandler(trainController.searchTrains));
router.get("/:trainNumber/location", asyncHandler(trainController.getTrainLocation));
router.get("/:id", asyncHandler(trainController.getTrainById));

module.exports = router;
