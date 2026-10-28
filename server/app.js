const express = require("express");
const path = require("path");

const equipmentRoutes = require("./routes/equipment.routes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend files
app.use(express.static(path.join(__dirname, "..")));

// API routes
app.use("/api/equipment", equipmentRoutes);

// Health check
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Equipment Rental Management System API is running."
    });
});

// Handle unknown API routes
app.use("/api", (req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found."
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`ERMS server running at http://localhost:${PORT}`);
});