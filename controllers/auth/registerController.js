const userSchema = require("../../validation/auth/userSchemaZod.js");
const bcrypt = require("bcrypt");
const {PrismaClient} = require("../../generated/prisma");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const {
    missingFieldsError,
    validationError,
    conflictError,
    databaseError
} = require("../../utils/errorResponses");

const registerController = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json(missingFieldsError("Username, email, and password are required"));
        }

        const validationResult = userSchema.safeParse({ username, email, password });
        
        if (!validationResult.success) {
            return res.status(422).json(validationError(validationResult.error.issues));
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },  
                    { username: username } 
                ]
            }
        });

        if (existingUser) {
            const field = existingUser.email === email ? 'email' : 'username';
            return res.status(409).json(conflictError(
                `User with this ${field} already exists`,
                field
            ));
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                username: username,  
                email: email,             
                password: hashedPassword
            }
        });

        const token = jwt.sign(
            { 
                userId: newUser.id,
                email: newUser.email 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
        );

        return res.status(201).json({
            data: {
                type: "users",
                id: newUser.id.toString(),
                attributes: {
                    username: newUser.username,
                    email: newUser.email,
                    createdAt: newUser.createdAt,
                    updatedAt: newUser.updatedAt
                },
                links: {
                    self: `/api/users/${newUser.id}`
                }
            },
            meta: {
                token: token,
                expiresIn: process.env.JWT_EXPIRES_IN || "7d"
            }
        });

    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json(databaseError(error));
    }
};

module.exports = registerController;