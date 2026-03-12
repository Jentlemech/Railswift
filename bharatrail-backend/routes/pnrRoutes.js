const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const pnrController = require("../controllers/pnrController");

const router = express.Router();

router.get("/:pnr", asyncHandler(pnrController.getPnrStatus));

module.exports = router;
