const {PrismaClient} = require("../../generated/prisma");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({
                errors: [
                    {
                        status: "400",
                        title: "Missing Fields",
                        detail: "Email and password are required",
                        source: {
                            pointer: "/data/attributes"
                        }
                    }
                ]
            });
        }

        // Find user by email
        const existingUser = await prisma.user.findFirst({
            where: { email: email }
        });

        if (!existingUser) {
            return res.status(401).json({
                errors: [
                    {
                        status: "401",
                        title: "Unauthorized",
                        detail: "Invalid email or password",
                        source: {
                            pointer: "/data/attributes/email"
                        }
                    }
                ]
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                errors: [
                    {
                        status: "401",
                        title: "Unauthorized",
                        detail: "Invalid email or password",
                        source: {
                            pointer: "/data/attributes/password"
                        }
                    }
                ]
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: existingUser.id,
                email: existingUser.email 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
        );

        // Successful login response
        return res.status(200).json({
            data: {
                type: "users",
                id: existingUser.id.toString(),
                attributes: {
                    username: existingUser.username,
                    email: existingUser.email,
                    createdAt: existingUser.createdAt,
                    updatedAt: existingUser.updatedAt
                },
                links: {
                    self: `/api/users/${existingUser.id}`
                }
            },
            meta: {
                token: token,
                expiresIn: process.env.JWT_EXPIRES_IN || "7d"
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            errors: [
                {
                    status: "500",
                    title: "Internal Server Error",
                    detail: "An unexpected error occurred during login"
                }
            ]
        });
    }
};

module.exports = loginController;