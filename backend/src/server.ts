import taskRouter from "./taskRoutes.js";
import projectRouter from "./projectRoutes.js";
import "./modelRelations.js";
import sequelize from "./database.js";
import express  from "express";
import cors from "cors";
import authRouter from "./auth.js";
const app=express(); // backend application
const port=3000; // port onwhich it will run
app.use(cors()); // this allows front end and backend talk to each other
app.use(express.json()); // if the frontend sends JSON in the HTTP request body, read it and convert it into a JavaScript object
app.use("/api/auth", authRouter); // to make sure the backend is working
app.use("/api/projects", projectRouter); // to get the endpoint of projects
app.use("/api/projects", taskRouter);
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
// start the backend application and connects the pieces together