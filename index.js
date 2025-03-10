import express from "express";
import cors from "cors";
import "dotenv/config";
import { dbConnection } from "./db.js";
import UserRouter from "./routes/userRouter.js";
import weatherRouter from "./routes/weatherRoute.js";

const app = express();

// middleware for parsing request body
app.use(express.json());
app.use(cors());

try {
  dbConnection();
  app.listen(process.env.PORT, (req, res) => {
    console.log(`server is running on ${process.env.PORT}`);
  });
} catch (error) {
  console.error("COULD NOT CONNECT TO DATABASE:", error.message);
}

// routes
app.use("/api/user", UserRouter);
app.use("/api/weatherData", weatherRouter);

// sending email using nodemailer
import "./cronJob.js";

app.get("/", function (req, res) {
  res.send("hello vercel");
});
