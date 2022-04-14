const express = require('express')
const morgan = require('morgan')
const createError = require('http-errors')
require('dotenv').config()
require('./helpers/inti_mongodb')
const Authroute = require('./routes/auth.route')
const {verifyAccessToken} = require('./helpers/jwt_helper')
require('./helpers/init_redis')
const app = express()
const PORT = process.env.PORT || 3000
app.use(morgan('dev'))
app.use(express.json())
// app.use(express.urlencoded({extended:true}))
app.get('/',async(req,res,next)=>{
    res.send('new Changes')
})


app.use('/auth',Authroute)




app.use(async (req,res,next)=>{
    // const error = new Error("Not Found")
    // error.status =404
    // next(error)
    next(createError.NotFound('this route dose not exist'))
})

app.use((err,req,res,next)=>{
    res.status(err.status || 500)
    res.send({
        error:{
            status:err.status || 500,
            message:err.message,
        }
    })
})


const server = app.listen(PORT,()=>{
    const port = server.address().port;
    console.log(`Server running on port ${port}`)
})