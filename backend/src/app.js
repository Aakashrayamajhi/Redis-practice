import express from "express"
import cors from "cors"
import ratelimiter from "./config/fixed_window_counter.config.js"
import redis from "./config/redis.config.js"

const app = express()

redis.set("testkey", "helo")
  .then(() => redis.get("testkey"))
  .then(value => console.log("Value from Redis:", value))
  .catch(err => console.error("Redis error:", err));

app.use(cors({
    origin: "http://localhost:5173",  
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true                  
}));
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(ratelimiter)


app.get("/",(req , res)=>{
    res.send("hello")
})

//handling Routes 

import userRouter from "./modules/user/user.route.js"

app.use("/api/v1/user", userRouter)


export {app}