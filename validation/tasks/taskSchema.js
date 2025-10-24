const { z } = require("zod");

const taskSchema = z.object({
    title: z.string(),
    description: z.string(),
})


module.exports = taskSchema