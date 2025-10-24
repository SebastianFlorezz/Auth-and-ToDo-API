const jwt = require("jsonwebtoken");
const {PrismaClient} = require("../generated/prisma");
const prisma = new PrismaClient();

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            errors: [
                {
                    status: "401",
                    title: "Unauthorized",
                    detail: "Access token required"
                }
            ]
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Verify user still exists in database
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, username: true, email: true }
        });

        if (!user) {
            return res.status(401).json({
                errors: [
                    {
                        status: "401",
                        title: "Unauthorized", 
                        detail: "User no longer exists"
                    }
                ]
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({
            errors: [
                {
                    status: "403",
                    title: "Forbidden",
                    detail: "Invalid or expired token"
                }
            ]
        });
    }
};

module.exports = { authenticateToken };