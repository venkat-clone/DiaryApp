const JWT = require('jsonwebtoken')
const createError = require('http-errors')
const client = require('./init_redis')

module.exports ={
    signAccessToken:(userId)=>{
        return new Promise((resolve,reject)=>{
            const Payload = {}
            const opctions ={
                expiresIn:'40d',
                issuer:'mypost.com',
                audience:userId
            }
            JWT.sign(Payload,process.env.ACCESS_PRIATE_KEY,opctions,(err,token)=>{
                if(err) {
                    console.log(err)
                    reject(createError.InternalServerError())
                    return
                }
                resolve(token)


            })
        })
    },
    verifyAccessToken:(req,res,next)=>{
        if(!req.headers['authorization']) return next(createError.Unauthorized('una'))
        const authheader = req.headers['authorization']
        const bearearToken = authheader.split(' ')
        const token = bearearToken[1]
        JWT.verify(token,process.env.ACCESS_PRIATE_KEY,(err,Payload)=>{
            if(err) {
                // if(err.name === 'JsonWebTokenError'){
                //     console.log(`${err.name}`)
                //     return next(createError.Unauthorized())
                // }
                // else{
                //     return next(createError.Unauthorized(err.message))
                // }
                const message = err.name === 'JsonWebTokenError'?'Unauthorized':err.message
                return next(createError.Unauthorized(message))
            }

            
            req.Payload = Payload
            next()
            
        })
    },
    signRefreshToken:(userId)=>{
        return new Promise((resolve,reject)=>{
            const Payload = {}
            const opctions ={
                expiresIn:'30d',
                issuer:'mypost.com',
                audience:userId
            }
            JWT.sign(Payload,process.env.REFRESH_PRIATE_KEY,opctions,(err,token)=>{
                if(err) {
                    console.log(err)
                    reject(createError.Unauthorized())
                    return
                }
                client.set(userId,token).catch((err)=>{
                    console.log(err.message)
                    reject(createError.InternalServerError)
                }).then(()=>{
                    resolve(token)
                })
                // NOT WORKING CODE
                // client.SET(userId,token, async (err,reply)=>{
                //     console.log('hbjhbhj')
                //     if(err){
                //         console.log(err.message)
                //         reject(createError.InternalServerError())
                //         return
                //     }
                //     else {
                //         console.log(reply)
                //         resolve(token)
                //     }
                // })

            })
        })
    },
    verifyRefreshToken:(refreshToken)=>{
        return new Promise((resolve,reject)=>{
            JWT.verify(refreshToken,process.env.REFRESH_PRIATE_KEY,(err,Payload)=>{
                if(err) return reject(createError.Unauthorized())
                const userId = Payload.aud

                client.get(userId).then(()=>resolve(userId)).catch((err)=>{
                    console.log(err.message)
                    reject(createError.InternalServerError)
                    return
                })
                // CODE NOT WORKING
                // client.GET(userId,(err,value)=>{
                //     if(err){
                //         console.log(err.message)
                //         reject(createError.InternalServerError)
                //         return
                //     }
                //     // req.Payload = Payload
                //     resolve(userId)
                // })

            })
        })
    }
}
