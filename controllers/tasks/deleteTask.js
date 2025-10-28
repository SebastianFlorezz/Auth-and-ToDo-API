const {PrismaClient} = require("../../generated/prisma");
const { forbiddenError, notFoundError, databaseError } = require("../../utils/errorResponses.js");
const prisma = new PrismaClient();


const deleteTaskController = async (req, res) => {
    try{
        const taskId = parseInt(req.params.id);
        const userIdParams = req.user.id


        const existingTask = await prisma.tasks.findUnique({
            where: {id: taskId}
        })

        if(!existingTask){
            return res.status(404).json(notFoundError("Task not found"))
        }

        if(existingTask.userId !== userIdParams){
            return res.status(403).json(forbiddenError("You do not have permission to update this task"))
        }

        const deletedTask = await prisma.tasks.delete({
            where:{
                id: taskId
            }
        })

        return res.status(200).json({
            data: {
                type: "tasks",
                id: deletedTask.id.toString(), 
                attributes: {
                    title: deletedTask.title, 
                    description: deletedTask.description, 
                    createdAt: deletedTask.createdAt,
                    updatedAt: deletedTask.updatedAt
                },
                relationships: {
                    user: {
                        data: {
                            type: "users",
                            id: deletedTask.userId.toString()
                        },
                        links: {
                            related: `/api/users/${deletedTask.userId}`
                        }
                    }
                },
                links: {
                    self: `/api/tasks/${deletedTask.id}`
                }
            }
        })



    } catch(error){
        console.error("Task error", error);
        return res.status(500).json(databaseError(error))
    }
}

module.exports = deleteTaskController;