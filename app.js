const express = require("express");
const app = express();
const {PrismaClient} = require("./generated/prisma")
require("dotenv").config()
PORT = process.env.PORT
const prisma = new PrismaClient()
const userRoutes = require("./routes/authRoutes.js")

app.listen(PORT, (error) => {
    if(error){
        console.error("Failed to start sever:",error)
    }

    console.log("Server initialized in PORT: ", PORT)
})

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use("/users", userRoutes)

