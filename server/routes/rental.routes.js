
const express = require("express");

const {
    createRental,
    getMyRentals,
    getAllRentals,
    updateRentalStatus
} = require("../controllers/rental.controller");

const {
    authenticateToken,
    requireAdmin
} = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", authenticateToken, createRental);

router.get("/my", authenticateToken, getMyRentals);

router.get("/", authenticateToken, requireAdmin, getAllRentals);

router.put("/:id/status", authenticateToken, requireAdmin, updateRentalStatus);

module.exports = router;
