const joi = require('@hapi/joi')

const authSchema = joi.object({
    Uname:joi.string().min(3).required(),
    email:joi.string().email().lowercase().required(),
    password:joi.string().min(4).required(),
    UserId:joi.string().required(),
})


module.exports = {authSchema}