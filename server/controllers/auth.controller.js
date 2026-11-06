
const { readCSV, writeCSV } = require("../services/csv.service");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const FILE = "users.csv";

const COLUMNS = [
    "id", "firstName", "lastName", "email",
    "password", "phone", "role", "createdAt"
];

async function register(req, res) {
    try {
        const { firstName, lastName, email, password, phone } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Complete all required fields."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email address."
            });
        }

        const users = await readCSV(FILE);

        if (users.some(user => user.email.toLowerCase() === normalizedEmail)) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered."
            });
        }

        const id = users.reduce(
            (max, user) => Math.max(max, Number(user.id) || 0), 0
        ) + 1;

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = {
            id,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            phone: phone || "",
            role: "customer",
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        await writeCSV(FILE, users, COLUMNS);

        res.status(201).json({
            success: true,
            message: "Registration successful."
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Registration failed."
        });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const users = await readCSV(FILE);
        const user = users.find(
            item => item.email.toLowerCase() === email.trim().toLowerCase()
        );

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const token = jwt.sign(
            {
                id: Number(user.id),
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        );

        res.json({
            success: true,
            message: "Login successful.",
            token,
            user: {
                id: Number(user.id),
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Login failed."
        });
    }
}

module.exports = { register, login };
