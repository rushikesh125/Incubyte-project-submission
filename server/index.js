import express, { application } from "express"
import dotenv from "dotenv"
import cors from "cors"


dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });


const app = express();

// middlewares
app.use(cors())
app.use(express.json())



const PORT = process.env.PORT || 5000;


//  routes 
app.get("/",(req,res)=>{
    res.status(200).json({msg:"Hello , Everything is Ok"})
})


export default app; //for testing