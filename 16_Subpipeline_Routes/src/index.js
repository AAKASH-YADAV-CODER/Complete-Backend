import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Listening on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error in data response", err);
    process.exit(1);
  });
/*
IN post man create new collection and structure according to your choice , 
also there is environment which provide direct access in collection files DRY
its use to test at every stage of backend on API endpoints
*/
