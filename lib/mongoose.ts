import mongoose from "mongoose";
import { Store } from "@/constants/store.js";

let isConnected = false;

export async function connectToDB() {
  mongoose.set("strictQuery", true);

  if (!process.env.MONGODB_URL) {
    console.log("MONGODB_URL not found");
    return;
  }

  if (isConnected) {
    console.log("Already connected to MongoDB");
    return;
  }

  try {
    const uri = `${process.env.MONGODB_URL}`.replace("/?", `/${Store.database}?`);
    await mongoose.connect(uri);
    
    isConnected = true;
    console.log(`Connected to MongoDB database: ${Store.database}`);
  } catch (error) {
    console.log("Error connecting to MongoDB:", error);
  }
}
