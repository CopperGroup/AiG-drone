import mongoose from "mongoose";

const valueSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    value:{
        type: String,
    }
})

const Value = mongoose.models.Value || mongoose.model("Value", valueSchema);

export default Value;