import app from "./index.js";


const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log("SERVER STARTED ON PORT:",PORT);
})