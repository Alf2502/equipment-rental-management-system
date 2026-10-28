const express = require("express");

const {
    getAllEquipment,
    getEquipmentById
} = require("../controllers/equipment.controller");

const router = express.Router();

// GET /api/equipment
router.get("/", getAllEquipment);

// GET /api/equipment/:id
router.get("/:id", getEquipmentById);

module.exports = router;