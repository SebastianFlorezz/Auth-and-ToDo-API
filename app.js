const express = require("express");
const app = express();
const {PrismaClient} = require("./generated/prisma")
require("dotenv").config()
PORT = process.env.PORT
const prisma = new PrismaClient()
const userRoutes = require("./routes/authRoutes.js")
const taskRoutes = require("./routes/taskRoutes.js")

app.listen(PORT, (error) => {
    if(error){
        console.error("Failed to start sever:",error)
    }

    console.log("Server initialized in PORT: ", PORT || 5000 )
    console.log(`Documentation: http://localhost:${PORT || 5000}/api-docs/`)
})

app.use(express.json())
app.use(express.urlencoded({extended: true}))

//swagger io 

const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./docs/swagger.yaml")


app.use("/users", userRoutes)
app.use("/tasks", taskRoutes)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
