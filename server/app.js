
require("dotenv").config();

const express = require("express");
const path = require("path");

const equipmentRoutes = require("./routes/equipment.routes");
const authRoutes = require("./routes/auth.routes");
const rentalRoutes = require("./routes/rental.routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "..")));

app.use("/api/equipment", equipmentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/rentals", rentalRoutes);

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "ERMS API is running."
    });
});

app.use("/api", (req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found."
    });
});

app.use((err, req, res, next) => {
    console.error(err);

    res.status(500).json({
        success: false,
        message: "Internal server error."
    });
});

app.listen(PORT, () => {
    console.log(`ERMS server running at http://localhost:${PORT}`);
});
