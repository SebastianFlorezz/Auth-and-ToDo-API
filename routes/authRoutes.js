const { Router } = require("express");
const registerController = require("../controllers/auth/registerController");
const loginController = require("../controllers/auth/loginController");
const router = Router();


router.post("/register", registerController);
router.post("/login", loginController)

module.exports = router; 