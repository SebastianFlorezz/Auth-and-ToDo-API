const {PrismaClient} = require("../../generated/prisma");
const prisma = new PrismaClient();
const taskSchema = require("../../validation/tasks/taskSchema.js")

const createTaskController = async (req, res) => {
    try{

    
        const { title, description } = req.body;
        const userId = req.user.id

        if (!title){
            return res.status(400).json({
                errors: [
                    {
                        status: "400",
                        title: "Missing Fields",
                        detail: "Title is required",
                        source: {
                            pointer: "/data/attributes"
                        }
                    }
                ]
            });
        }



        const taskValidation = taskSchema.safeParse({ title, description });

        if (!taskValidation.success) {
            const errors = taskValidation.error.issues.map(issue => ({
                status: "422",
                title: "Unprocessable Content",
                detail: issue.message,
                source: {
                    pointer: `/data/attributes/${issue.path[0]}`
                }
            }));

            return res.status(422).json({ errors });
        }


        const newTask = await prisma.tasks.create({
            data: {
                title: title,
                description: description,
                userId: userId
            }
        });

        return res.status(201).json({
            data: {
                type: "tasks",
                id: newTask.id.toString(), 
                attributes: {
                    title: newTask.title, 
                    description: newTask.description, 
                    createdAt: newTask.createdAt,
                    updatedAt: newTask.updatedAt
                },
                relationships: {
                    user: {
                        data: {
                            type: "users",
                            id: newTask.userId.toString()
                        },
                        links: {
                            related: `/api/users/${newTask.userId}`
                        }
                    }
                },
                links: {
                    self: `/api/tasks/${newTask.id}`
                }
            }
        });
    } catch (error) {
        console.error("Task creation error:", error);

       //if user doesnt exist
        if (error.code === 'P2003') {
            return res.status(400).json({
                errors: [
                    {
                        status: "400",
                        title: "Invalid User",
                        detail: "The specified user does not exist",
                        source: {
                            pointer: "/data/relationships/user"
                        }
                    }
                ]
            });
        }


        // database connection error
        if (error.code === 'P1001') {
            return res.status(503).json({
                errors: [
                    {
                        status: "503",
                        title: "Service Unavailable", 
                        detail: "Database connection failed",
                        meta: {
                            code: error.code
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
                    detail: "Failed to create task",
                }
            ]
        });     
    }


};

module.exports = createTaskController;