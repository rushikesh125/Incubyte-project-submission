import express from "express"
import dotenv from "dotenv"
dotenv.config();
const app = express();

const PORT = process.env.PORT || 5000;


app.use(express.json())

app.get("/",(req,res)=>{
    res.status(200).json({msg:"Hello , Everything is Ok"})
})

app.listen(PORT,()=>{
    console.log("SERVER STARTED ON PORT:",PORT);
})