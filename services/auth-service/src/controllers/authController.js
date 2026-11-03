
const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");

async function register(req, res) {
    try {
        const { username, password } = req.body;

        if (
            typeof username !== "string" ||
            typeof password !== "string" ||
            !username.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: "Username and password are required"
            });
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                username: username.trim()
            }
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Username already exists"
            });
        }

        const customerRole = await prisma.role.findUnique({
            where: {
                rolename: "CUSTOMER"
            }
        });

        if (!customerRole) {
            return res.status(500).json({
                message: "Default CUSTOMER role is not configured"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username: username.trim(),
                password: hashedPassword,
                roleid: customerRole.roleid
            },
            select: {
                uid: true,
                username: true,
                roleid: true
            }
        });

        return res.status(201).json({
            message: "Registration successful",
            user
        });
    } catch (error) {
        if (error.code === "P2002") {
            return res.status(409).json({
                message: "Username already exists"
            });
        }

        console.error("Register error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

async function login(req, res) {
    try {
        const { username, password } = req.body;

        if (
            typeof username !== "string" ||
            typeof password !== "string" ||
            !username.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: "Username and password are required"
            });
        }

        const user = await prisma.user.findUnique({
            where: {
                username: username.trim()
            },
            include: {
                role: true
            }
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid username or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid username or password"
            });
        }

        const jwt = require("jsonwebtoken");

        const token = jwt.sign(
            {
                uid: user.uid,
                role: user.role.rolename
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "1d"
            }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                uid: user.uid,
                username: user.username,
                role: user.role.rolename
            }
        });
    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

module.exports = {
    register,
    login
};
