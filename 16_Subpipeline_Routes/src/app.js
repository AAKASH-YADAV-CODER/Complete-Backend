import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(
  cors({
    origin: process.env.ORIGIN_URL_CORS,
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "16kbs" }));
app.use(express.static("public"));
app.use(cookieParser());

//import Routes
import userRouter from "./routes/user.routes.js";

//Route Declaration
app.use("/api/v1/users", userRouter);

export { app };
