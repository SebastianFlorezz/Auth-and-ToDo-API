const {PrismaClient} = require("../../generated/prisma");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const {
    missingFieldsError,
    conflictError,
    databaseError
} = require("../../utils/errorResponses");

const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;


        if (!email || !password) {
            return res.status(400).json(missingFieldsError("Email and password are required"));
        }


        const existingUser = await prisma.user.findFirst({
            where: { email: email }
        });

        if (!existingUser) {
            return res.status(401).json(conflictError("Invalid email or password", "email"));
        }


        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        
        if (!isPasswordValid) {
            return res.status(401).json(conflictError("Invalid email or password", "password"));
        }


        const token = jwt.sign(
            { 
                userId: existingUser.id,
                email: existingUser.email 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
        );


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
        return res.status(500).json(databaseError(error));
    }
};

module.exports = loginController;