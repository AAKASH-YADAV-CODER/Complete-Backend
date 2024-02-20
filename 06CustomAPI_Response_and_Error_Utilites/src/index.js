import dotenv from "dotenv";
import connectDB from "./db/index.js";

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
This is First Directly Approach 
This by IIF immediate invoke function 
(async(){
    try{
    await mongoose.connect(`${process.env.MONGODB_URL}/${DATABASE_NAME}`);
    app.on(("error",err)=>{
    console.log("error in connection",err)
    throw err;
    })
    app.listen(process.env.PORT,()=>{
    console.log("listening on port ",process.env.PORT)
    })
    }catch(error){
    console.error("ERROR Occur",error);
    throw error;
    }
})()

or create manually function like

const connectDB=async()=>{
    try{
    await mongoose.connect(`${process.env.MONGODB_URL}/${DATABASE_NAME}`);
    app.on(("error",err)=>{
    console.log("error in connection",err)
    throw err;
    })
    app.listen(process.env.PORT,()=>{
    console.log("listening on port ",process.env.PORT)
    })
    }catch(error){
    console.error("ERROR Occur",error);
    throw error;
    }
}
connectDB();
*/
