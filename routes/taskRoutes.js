const { Router } = require("express");
const { authenticateToken } = require("../middlewares/auth");
const createTaskController = require("../controllers/tasks/createTask");
const router = Router();

router.post("/create", authenticateToken, createTaskController)


module.exports = router;