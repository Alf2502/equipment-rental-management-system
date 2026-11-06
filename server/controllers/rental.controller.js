
const { readCSV, writeCSV } = require("../services/csv.service");

const RENTAL_FILE = "rentals.csv";
const EQUIPMENT_FILE = "equipment.csv";

const COLUMNS = [
    "id",
    "userId",
    "equipmentId",
    "startDate",
    "endDate",
    "days",
    "dailyRate",
    "totalAmount",
    "status",
    "createdAt"
];

function validDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {
        return false;
    }

    const date = new Date(`${value}T00:00:00Z`);

    return !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value;
}

function dateDifference(start, end) {
    const first = new Date(`${start}T00:00:00Z`);
    const last = new Date(`${end}T00:00:00Z`);

    return Math.floor((last - first) / 86400000) + 1;
}

// CREATE RENTAL
async function createRental(req, res) {
    try {
        const { equipmentId, startDate, endDate } = req.body;

        if (!equipmentId || !validDate(startDate) || !validDate(endDate)) {
            return res.status(400).json({
                success: false,
                message: "Provide equipment ID and valid rental dates."
            });
        }

        if (endDate < startDate) {
            return res.status(400).json({
                success: false,
                message: "Return date cannot be before rental date."
            });
        }

        const equipment = await readCSV(EQUIPMENT_FILE);

        const item = equipment.find(
            record => Number(record.id) === Number(equipmentId)
        );

        if (!item || item.available !== "true") {
            return res.status(404).json({
                success: false,
                message: "Equipment is unavailable."
            });
        }

        const rentals = await readCSV(RENTAL_FILE);

        const unavailableStatuses = ["pending", "approved", "active"];

        const conflict = rentals.some(rental => {
            return Number(rental.equipmentId) === Number(equipmentId) &&
                unavailableStatuses.includes(rental.status) &&
                startDate <= rental.endDate &&
                endDate >= rental.startDate;
        });

        if (conflict) {
            return res.status(409).json({
                success: false,
                message: "Equipment is already booked for those dates."
            });
        }

        const days = dateDifference(startDate, endDate);
        const dailyRate = Number(item.rate);
        const totalAmount = days * dailyRate;

        const id = rentals.reduce(
            (max, rental) => Math.max(max, Number(rental.id) || 0), 0
        ) + 1;

        const newRental = {
            id,
            userId: req.user.id,
            equipmentId: Number(equipmentId),
            startDate,
            endDate,
            days,
            dailyRate,
            totalAmount,
            status: "pending",
            createdAt: new Date().toISOString()
        };

        rentals.push(newRental);

        await writeCSV(RENTAL_FILE, rentals, COLUMNS);

        res.status(201).json({
            success: true,
            message: "Rental booking submitted successfully.",
            data: newRental
        });

    } catch (error) {
        console.error("Rental creation error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to create rental booking."
        });
    }
}

// CUSTOMER RENTAL HISTORY
async function getMyRentals(req, res) {
    try {
        const rentals = await readCSV(RENTAL_FILE);

        const myRentals = rentals.filter(
            rental => Number(rental.userId) === Number(req.user.id)
        );

        res.json({
            success: true,
            count: myRentals.length,
            data: myRentals
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve rental history."
        });
    }
}

// ADMIN: VIEW ALL RENTALS
async function getAllRentals(req, res) {
    try {
        const rentals = await readCSV(RENTAL_FILE);
        const users = await readCSV("users.csv");
        const equipment = await readCSV(EQUIPMENT_FILE);

        const data = rentals.map(rental => {
            const user = users.find(
                item => Number(item.id) === Number(rental.userId)
            );

            const item = equipment.find(
                record => Number(record.id) === Number(rental.equipmentId)
            );

            return {
                ...rental,
                customer: user
                    ? `${user.firstName} ${user.lastName}`
                    : "Unknown",
                equipmentName: item ? item.name : "Unknown"
            };
        });

        res.json({
            success: true,
            count: data.length,
            data
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve rentals."
        });
    }
}

// ADMIN: UPDATE RENTAL STATUS
async function updateRentalStatus(req, res) {
    try {
        const allowedStatuses = [
            "pending",
            "approved",
            "active",
            "completed",
            "cancelled"
        ];

        const { status } = req.body;

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid rental status."
            });
        }

        const rentals = await readCSV(RENTAL_FILE);

        const index = rentals.findIndex(
            rental => Number(rental.id) === Number(req.params.id)
        );

        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: "Rental not found."
            });
        }

        rentals[index].status = status;

        await writeCSV(RENTAL_FILE, rentals, COLUMNS);

        res.json({
            success: true,
            message: "Rental status updated successfully."
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Unable to update rental status."
        });
    }
}

module.exports = {
    createRental,
    getMyRentals,
    getAllRentals,
    updateRentalStatus
};
