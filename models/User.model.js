const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const ProfileSchma = new mongoose.Schema({
    Uname:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        lowercase:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    Dirays:{
        type:Array,
        default:[],
    },
    DiryCount:{
        type:Number,
        default:0
    }

})


ProfileSchma.pre('save',async function (next) {
    try {
        const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password,salt)
        next()
    } catch (error) {
        next(error)
    }
})

ProfileSchma.pre('updateOne',async function(doc,next){
    try{
        next()
    }
    catch (error){
        next(error)
    }
})


ProfileSchma.methods.isValidPassword = async function(password){

    try {
        return await bcrypt.compare(password,this.password)
    } catch (error) {
        throw error
    }

}

const User = mongoose.model('User',ProfileSchma)

module.exports = User
