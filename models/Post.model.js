const mongoose = require('mongoose')

const PostSchema = mongoose.Schema({
    UserId:{
        type:String,
        require:true,
    },
    postcontent:{
        type:String,
        require:true,
    },
    date:{
        type:Date,
        default:Date()
    },
    mood:{
        type:String,
    }
})

const UserPostSchema = mongoose.Schema({
    postcontent:{
        type:String,
        require:true,
    },
    date:{
        type:Date,
        default:Date(),
    },
    postId:{
        type:String,
        require:true,
    }
})



PostSchema.pre("save",async function (next){
    try {
        
        next()
    } catch (error) {
        next(error)
    }

})


const Post = mongoose.model('Post',PostSchema)
const UserPost = mongoose.model('post',UserPostSchema)
module.exports = {Post,UserPost}