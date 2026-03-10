import Radis from "ioredis"

const redis  = new Radis({
    host : "127.0.0.1",
    port :6379
} )

const limit = 10;
const window = 60;

const ratelimiter = async (req , res , next)=>{
    try{
const ip = req.ip
const key = `rate_limit : ${ip}`
const  request = await redis.incr(key)

if(request === 1){
    await redis.expire(key ,window)

}

if(request > limit){
    return res.status(429).json({
        success :  false,
        message : "Too many request, please try letter",
    })
}

next()

    } catch(error){
        console.log("error occur in Ratelimiting:", error)
    }


}

export default ratelimiter

