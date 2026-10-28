const pool = require("../config/database");

async function getAllEquipment(req, res) {
    try {
        const [equipment] = await pool.query(`
            SELECT
                id,
                name,
                category,
                category_name AS categoryName,
                description,
                daily_rate AS rate,
                icon,
                available
            FROM equipment
            ORDER BY id ASC
        `);

        res.status(200).json({
            success: true,
            count: equipment.length,
            data: equipment
        });
    } catch (error) {
        console.error("Error retrieving equipment:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve equipment."
        });
    }
}

async function getEquipmentById(req, res) {
    try {
        const [equipment] = await pool.execute(
            `SELECT
                id,
                name,
                category,
                category_name AS categoryName,
                description,
                daily_rate AS rate,
                icon,
                available
             FROM equipment
             WHERE id = ?`,
            [req.params.id]
        );

        if (equipment.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Equipment not found."
            });
        }

        res.status(200).json({
            success: true,
            data: equipment[0]
        });
    } catch (error) {
        console.error("Error retrieving equipment:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve equipment."
        });
    }
}

module.exports = {
    getAllEquipment,
    getEquipmentById
};