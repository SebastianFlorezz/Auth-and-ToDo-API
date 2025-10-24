const { z } = require("zod");

const UserSchema = z.object({
    username: z.string(),
    email: z.email(),
    password: z.string().regex(/(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, "Password must contain at least one uppercase letter, one number and 8 characters"),

});




module.exports = UserSchema;