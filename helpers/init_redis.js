const redis = require('redis')

const client = redis.createClient({
    port:'6379',
    host:"127.0.0.1"
})


client.on('connect',()=>{
    console.log('client connected to redis....')
})
client.on('ready',()=>{
    console.log('client connected and ready to use.........')
})
client.on('error',(err)=>{
    console.log('lmlkm')
    console.log(err.message)
})
client.on('end',()=>{
    console.log('client disconnected from redis')
})
process.on('SIGINT',()=>{
    client.quit()})

    client.connect()
module.exports = client