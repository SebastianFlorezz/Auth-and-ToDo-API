const {PrismaClient} = require("../../generated/prisma");
const { missingFieldsError, validationError, databaseError } = require("../../utils/errorResponses.js");
const prisma = new PrismaClient();
const taskSchema = require("../../validation/tasks/taskSchema.js")

const createTaskController = async (req, res) => {
    try{

    
        const { title, description } = req.body;
        const userId = req.user.id

        if (!title){
            return res.status(400).json(missingFieldsError("Title is required"))
        };


        const taskValidation = taskSchema.safeParse({ title, description });

        if(!taskValidation){
            return res.status(422).json(validationError(taskValidation.error.issues))
        };


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
        console.error("Creating task error", error);
        return res.status(500).json(databaseError(error))
}};

module.exports = createTaskController;