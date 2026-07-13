import mongoose from "mongoose";
import { config, requireEnv } from "../config/env.js";

const connectDB = async ()=>{
   try{
    await mongoose.connect(requireEnv(config.mongodbUrl, "MONGODB_URL"));
    console.log("MongoDB Connected....")
   } catch (error){
    console.error(error.message);
    process.exit(1);
   }
};

export default connectDB;
