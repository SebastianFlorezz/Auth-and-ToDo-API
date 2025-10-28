const {PrismaClient} = require("../../generated/prisma");
const { validationError, forbiddenError, notFoundError, databaseError } = require("../../utils/errorResponses.js");
const prisma = new PrismaClient();
const taskSchema = require("../../validation/tasks/taskSchema.js")

const updateTaskController = async (req, res) => {
    try{
        const taskId = parseInt(req.params.id);
        const userIdParams = req.user.id

        const { title, description } = req.body;

        const taskValidation = taskSchema.safeParse({title, description});

        if(!taskValidation){
            return res.status(422).json(validationError(taskValidation.error.issues))
        }

        const existingTask = await prisma.tasks.findUnique({
            where: {id: taskId}
        })

        if(!existingTask){
            return res.status(404).json(notFoundError("Task not found"))
        }

        if(existingTask.userId !== userIdParams){
            return res.status(403).json(forbiddenError("You do not have permission to update this task"))
        }

        const updatedTask = await prisma.tasks.update({
            where:{
                id: taskId
            },
            data: {
                title,
                description,
                userId: userIdParams
            },
        })

        return res.status(200).json({
            data: {
                type: "tasks",
                id: updatedTask.id.toString(), 
                attributes: {
                    title: updatedTask.title, 
                    description: updatedTask.description, 
                    createdAt: updatedTask.createdAt,
                    updatedAt: updatedTask.updatedAt
                },
                relationships: {
                    user: {
                        data: {
                            type: "users",
                            id: updatedTask.userId.toString()
                        },
                        links: {
                            related: `/api/users/${updatedTask.userId}`
                        }
                    }
                },
                links: {
                    self: `/api/tasks/${updatedTask.id}`
                }
            }
        })



    } catch(error){
        console.error("Task error", error);
        return res.status(500).json(databaseError(error))
    }
}

module.exports = updateTaskController;