
const { readCSV, writeCSV } = require("../services/csv.service");

const FILE = "equipment.csv";

const COLUMNS = [
    "id",
    "name",
    "category",
    "categoryName",
    "description",
    "rate",
    "icon",
    "available"
];

function normalize(item) {
    return {
        ...item,
        id: Number(item.id),
        rate: Number(item.rate),
        available: item.available === true || item.available === "true"
    };
}

async function getAllEquipment(req, res) {
    try {
        const records = await readCSV(FILE);
        const equipment = records.map(normalize);

        res.json({
            success: true,
            count: equipment.length,
            data: equipment
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Unable to retrieve equipment."
        });
    }
}

async function getEquipmentById(req, res) {
    try {
        const records = await readCSV(FILE);
        const item = records.find(
            record => Number(record.id) === Number(req.params.id)
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Equipment not found."
            });
        }

        res.json({ success: true, data: normalize(item) });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Unable to retrieve equipment."
        });
    }
}

async function createEquipment(req, res) {
    try {
        const { name, category, categoryName, description, rate, icon, available } = req.body;

        if (!name || !category || !categoryName ||
            !Number.isFinite(Number(rate)) || Number(rate) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Provide a name, category, category name, and valid rate."
            });
        }

        const records = await readCSV(FILE);
        const id = records.reduce(
            (max, item) => Math.max(max, Number(item.id) || 0), 0
        ) + 1;

        const newItem = {
            id,
            name: name.trim(),
            category,
            categoryName,
            description: description || "",
            rate: Number(rate),
            icon: icon || "📦",
            available: available === undefined ? true : Boolean(available)
        };

        records.push(newItem);
        await writeCSV(FILE, records, COLUMNS);

        res.status(201).json({
            success: true,
            message: "Equipment added successfully.",
            data: newItem
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Unable to add equipment."
        });
    }
}

async function updateEquipment(req, res) {
    try {
        const records = await readCSV(FILE);
        const index = records.findIndex(
            item => Number(item.id) === Number(req.params.id)
        );

        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: "Equipment not found."
            });
        }

        const { name, category, categoryName, description, rate, icon, available } = req.body;

        if (!name || !category || !categoryName ||
            !Number.isFinite(Number(rate)) || Number(rate) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Provide valid equipment details."
            });
        }

        records[index] = {
            id: Number(records[index].id),
            name: name.trim(),
            category,
            categoryName,
            description: description || "",
            rate: Number(rate),
            icon: icon || "📦",
            available: available === undefined
                ? records[index].available === "true"
                : Boolean(available)
        };

        await writeCSV(FILE, records, COLUMNS);

        res.json({
            success: true,
            message: "Equipment updated successfully."
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Unable to update equipment."
        });
    }
}

async function deleteEquipment(req, res) {
    try {
        const records = await readCSV(FILE);
        const filtered = records.filter(
            item => Number(item.id) !== Number(req.params.id)
        );

        if (filtered.length === records.length) {
            return res.status(404).json({
                success: false,
                message: "Equipment not found."
            });
        }

        await writeCSV(FILE, filtered, COLUMNS);

        res.json({
            success: true,
            message: "Equipment deleted successfully."
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Unable to delete equipment."
        });
    }
}

module.exports = {
    getAllEquipment,
    getEquipmentById,
    createEquipment,
    updateEquipment,
    deleteEquipment
};
