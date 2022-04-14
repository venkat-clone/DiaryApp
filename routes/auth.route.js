const express = require('express')
const router = express.Router()
const createError = require('http-errors')
const User = require('../models/User.model')
const {Post,UserPost} = require('../models/Post.model')
const {authSchema} = require('../helpers/Validation_Schema')
const {signAccessToken,signRefreshToken,verifyRefreshToken, verifyAccessToken} = require('../helpers/jwt_helper')
const { findOneAndDelete } = require('../models/User.model')
const request = require('request');
const https = require('https')

router.post('/register',async(req,res,next)=>{
    try {

        const validUser = await authSchema.validateAsync(req.body)
        const doseExist = await User.findOne({email:validUser.email})
        if(doseExist) throw createError.Conflict(`${validUser.email} already Exist`)
        const Newuser = await User.findOne({Uname:validUser.Uname})
        if(Newuser) throw createError.Conflict(`${validUser.Uname} already Exist`)
        const user = new User(validUser)
        const Saveduser = await user.save()
        const accestoken = await signAccessToken(Saveduser.id);
        const refreshToken = await signRefreshToken(Saveduser.id)

        res.send({accestoken,refreshToken})

    } catch (error) {
        console.log(error)
        if(error.isJoi === true) error.status = 422
        next(error)
    }
})
router.post('/login',async(req,res,next)=>{

    try {
        const validuser = req.body
        const User_ = await User.findOne({email:validuser.email})
        if(!User_) throw createError.NotFound("User Not Found")

        const isMatch = await User_.isValidPassword(validuser.password)
        if(!isMatch) throw createError.Unauthorized("User/password Not Valid")

        const accessToken = await signAccessToken(User_.id)
        console.log("okaokoko")

        const refreshToken = await signRefreshToken(User_.id)
        console.log("okaokoko")

        res.send({accessToken,refreshToken})
    } catch (error) {
        if(error.isJoi == true ) return next(createError.BadRequest("Invali Username/Password"))
        next(error)
    }
    
})
router.post('/refresh-token',async(req,res,next)=>{
    try {
        const {refreshToken }= req.body
        if(!refreshToken) throw createError.BadRequest()

        const UserId = await verifyRefreshToken(refreshToken)
        if(!UserId) throw createError.BadRequest()
        console.log("okay")
        const accestoken = await signAccessToken(UserId)
        const refresh = await signRefreshToken(UserId)
        
        res.send({accestoken,refresh})

    } catch (error) {
        next(error)
    }

})
router.post('/logout',async(req,res,next)=>{
    res.send('logout route')
    
})

router.post('/createpost',verifyAccessToken,async(req,res,next)=>{
    try {
        const {postcontent} = req.body
        const UserId = req.Payload.aud
        if(!UserId) throw createError.InternalServerError
        const Newpost = Post({UserId,postcontent})
        const s = await Newpost.save()
        await User.updateOne({UserId},{$push:{Dirays:{postId:s._id.valueOf()}},$inc: { DiryCount: 1 } })
        res.send(Newpost)

    } catch (error) {
        console.log(error)
        next(error)
    }
})

router.post('/deletepost',verifyAccessToken,async(req,res,next)=>{
    try {
        const {postId} = req.body
        const UserId = req.Payload.aud
        const DeletedPost = await Post.findByIdAndDelete(postId)
        if(!DeletedPost) throw createError.BadRequest('Post Not Found')
        const UPost = await User.findOneAndUpdate({UserId},{$pull:{Dirays:{postId:DeletedPost._id.valueOf()}},$inc: { DiryCount: -1 } })        
        if(!UPost) throw createError.BadRequest('Post Not Found')
        res.send('post has been Deleted')

    } catch (error) {
        next(error)
    }
})

router.get('/MyPosts',verifyAccessToken,async(req,res,next)=>{
    try {
        const UserId=req.Payload.aud
        const MyPosts = await Post.find({UserId:UserId})
        if(MyPosts.length==0) res.send("NO Posts Have Been Created")
        else res.send(MyPosts)
    } catch (error) {
        next(error)
    }
})

router.get('/wallpapers',verifyAccessToken,async(req,res,next)=>{
    try {
        console.log("waiting")
        const {page} = req.body

        prms = {
            key: process.env.PIXBAYKEY,
            orientation:'vertical',
            editors_choice:'true',
            safesearch:'latest',
            per_page:30,
            page:page,
        }

        const x = await request(
            {url:process.env.PIXABAY_URL, qs:prms},
            function async(error,responce,body){
                if(!body || error ) {
                    if(error) console.log(error)
                    throw createError.InternalServerError()}
                res.send(body)
            }
        )
        console.log("end")
        // console.log(x.res)

        // const opctions = {
        //     hostname: 'pixabay.com',
        //     path: '/api',
        //     method: 'GET',
        //     port: 443,
        // }
        // const pix_res = https.request(opctions)
        // console.log("OKOKOKO")
        // console.log(pix_res)
        // res.send('Wallpaper Api')

    } catch (error){
        next(error)
    }
})



router.get('/quotes',verifyAccessToken,async(req,res,next)=>{
    try {
        console.log("waiting")
        const {page} = req.body

        prms = {page:page,maxLength:90}

        const x = await request(
            {url:process.env.QUOTES_URL, qs:prms},
            function async(error,responce,body){
                if(!body || error ) {
                    if(error) console.log(error)
                    throw createError.InternalServerError()}
                res.send(body)
            }
        )
        console.log("end")
    } catch (error) {
        next(error)
    }
})









module.exports = router