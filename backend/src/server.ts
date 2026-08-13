import sequelize from "./database.js";
import express  from "express";
import cors from "cors";
import authRouter from "./auth.js";
const app=express(); // backend application
const port=3000; // port onwhich it will run
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRouter);
app.get("/",(req,res)=>{
    res.json({message:"Backend is working"})
});
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });
  // these messages should appear in terminal 

app.listen(port,()=> {
  console.log(`Server is running on http://localhost:${port}`);
});