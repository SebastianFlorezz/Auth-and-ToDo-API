const userSchema = require("../../validation/auth/userSchemaZod.js");
const bcrypt = require("bcrypt");
const {PrismaClient} = require("../../generated/prisma");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
require("dotenv").config();

const registerController = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                errors: [
                    {
                        status: "400",
                        title: "Missing Fields",
                        detail: "Username, email, and password are required",
                        source: {
                            pointer: "/data/attributes"
                        }
                    }
                ]
            });
        }

        const validationResult = userSchema.safeParse({ username, email, password });
        
        if (!validationResult.success) {
            const errors = validationResult.error.issues.map(issue => ({
                status: "422",
                title: "Unprocessable Content",
                detail: issue.message,
                source: {
                    pointer: `/data/attributes/${issue.path[0]}`
                }
            }));

            return res.status(422).json({ errors });
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
            return res.status(409).json({
                errors: [
                    {
                        status: "409",
                        title: "Resource Conflict",
                        detail: `User with this ${field} already exists`,
                        source: {
                            pointer: `/data/attributes/${field}`
                        }
                    }
                ]
            });
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

        if (error.code === "P2002") {
            return res.status(409).json({
                errors: [
                    {
                        status: "409",
                        title: "Database Conflict",
                        detail: "A user with this email or username already exists",
                        source: {
                            pointer: "/data/attributes"
                        }
                    }
                ]
            });
        }

        return res.status(500).json({
            errors: [
                {
                    status: "500",
                    title: "Internal Server Error",
                    detail: "An unexpected error occurred during registration"
                }
            ]
        });
    }
};

module.exports = registerController;