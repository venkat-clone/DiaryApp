const express = require('express')
const router = express.Router()
const createError = require('http-errors')
const User = require('../models/User.model')
const {Post,UserPost} = require('../models/Post.model')
const {authSchema} = require('../helpers/Validation_Schema')
const {signAccessToken,signRefreshToken,verifyRefreshToken, verifyAccessToken} = require('../helpers/jwt_helper')
const { findOneAndDelete, findById } = require('../models/User.model')
const request = require('request');
const https = require('https')

router.post('/register',async(req,res,next)=>{
    try {
        console.log("step 1")
        const validUser = await authSchema.validateAsync(req.body)
        const doseExist = await User.findOne({email:validUser.email})
        if(doseExist) throw createError.Conflict(`${validUser.email} already Exist`)
        console.log("step 2")
        console.log(validUser)
        const user_ = await User(validUser).save()
        // const Saveduser = await user_.save()

        const accestoken = await signAccessToken(user_.id);
        const refreshToken = await signRefreshToken(user_.id)
        console.log("step 4")
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
        console.log(" Step 1")
        const User_ = await User.findOne({email:validuser.email})
        if(!User_) throw createError.NotFound("User Not Found")

        const isMatch = await User_.isValidPassword(validuser.password)
        if(!isMatch) throw createError.Unauthorized("User/password Not Valid")

        const accessToken = await signAccessToken(User_.id)

        const refreshToken = await signRefreshToken(User_.id)

        res.send({accessToken,refreshToken})
    } catch (error) {
        if(error.isJoi === true ) return next(createError.BadRequest("Invali Username/Password"))
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

router.post('/createdairy',verifyAccessToken,async(req,res,next)=>{
    try {
        const {postcontent,year,day} = req.body
        const UserId = req.Payload.aud
        if(!postcontent ||  !year || !day ) throw createError.BadRequest

        const Newpost = Post({UserId,postcontent,year,day})
        // const Newpost = Post({UserId,postcontent})
        const s = await Newpost.save()
        await User.updateOne({UserId},{$push:{Dirays:{postId:s._id.valueOf()}},$inc: { DiryCount: 1 } })
        res.send(Newpost)

    } catch (error) {
        console.log(error)
        next(error)
    }
})


router.post('/updatedairy',verifyAccessToken,async(req,res,next)=>{
    try {
        const {_id,postcontent} = req.body
        console.log(req.body)
        if(!_id ) throw createError.BadRequest        
        const post =await Post.updateOne({_id},{postcontent})
        res.send(await Post.findById(_id))

    } catch (error) {
        console.log(error)
        next(error)
    }
})

router.get('/user/dairys',verifyAccessToken,async(req,res,next)=>{
    try {
        const uId = req.Payload.aud
        // const user = await User.findById(uId)
        // const list = JSON.parse("[]")
        // user.Dirays.forEach(e=>{
        //     list.push({await Post.findById(e.postId)})
        // })
        const daitys  = await Post.find({UserId:uId})
        res.send(daitys)

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


router.get('/getDairy',verifyAccessToken,async(req,res,next)=>{
    try{
        const UserId = req.Payload.aud
        const MyDairy = await Dairy.find({UserId:UserId})

    }
    catch(error){
        next(error)
    }
})

router.get('/wallpapers',verifyAccessToken,async(req,res,next)=>{
    try {
        const {orientation} = req.body
        prms = {
            key: process.env.PIXBAYKEY,
            orientation:'vertical',
            editors_choice:'true',
            per_page:20,
            page:req.query.page|1,
        }

        const x = await request(
            {url:process.env.PIXABAY_URL, qs:prms},
            function async(error,responce,body){
                if(!body || error ) {
                    if(error) console.log(error)
                    throw createError.InternalServerError()}
                const json = JSON.parse(body)
                const final = JSON.parse("[]")
                json.hits.forEach(element => {
                   
                    final.push({
                        "url":element.largeImageURL})
                });
                res.send(final)
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

router.get('/search/wall',verifyAccessToken,async(req,res,next)=>{
    try {
        const {orientation} = req.body
        prms = {
            key: process.env.PIXBAYKEY,
            orientation:'vertical',
            editors_choice:'true',
            per_page:20,
            q:req.query.pix||"wallpapr",
            page:req.query.page|1,
        }

        const x = await request(
            {url:process.env.PIXABAY_URL, qs:prms},
            function async(error,responce,body){
                if(!body || error ) {
                    if(error) console.log(error)
                    throw createError.InternalServerError()}
                const json = JSON.parse(body)
                const final = JSON.parse("[]")
                // final.hits.pop()
                
                json.hits.forEach(element => {
                    final.push({
                        "url":element.largeImageURL})
                });
                res.send(final)
            }
        )
        console.log("end")

    } catch (error){
        next(error)
    }
})




router.get('/quotes',verifyAccessToken,async(req,res,next)=>{
    try {
        console.log("waiting")
        const {page} = req.body

        prms = {
            page:req.query.page,
            maxLength:60,
            limit:100}

        const x = await request(
            {url:process.env.QUOTES_URL, qs:prms},
            function async(error,responce,body){
                if(!body || error ) {
                    if(error) console.log(error)
                    throw createError.InternalServerError()}
                var json = JSON.parse(body)
                var final = JSON.parse("[]")
                json.results.forEach(element => {
                    final.push({
                        "quote":element.content})
                });
                console.log(final)
                res.send(final)
            }
        )
        console.log("end")
    } catch (error) {
        next(error)
    }
})









module.exports = router