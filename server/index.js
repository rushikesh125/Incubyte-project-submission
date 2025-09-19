import express, { application } from "express"
import dotenv from "dotenv"
import cors from "cors"
import AuthRouter from "./routes/auth.js";
import sweetsRouter from "./routes/sweets.js";
import path from 'path';

// Load environment-specific config
const envPath = process.env.NODE_ENV === 'test' 
  ? path.join(process.cwd(), '.env.test')
  : path.join(process.cwd(), '.env');

  dotenv.config({ path: envPath });

const app = express();

// middlewares
app.use(cors())
app.use(express.json())



const PORT = process.env.PORT || 5000;


//  routes 
app.get("/",(req,res)=>{
    res.status(200).json({msg:"Hello , Everything is Ok"})
})

app.use('/api/auth',AuthRouter);
app.use('/api/sweets',sweetsRouter);

export default app; //for testing