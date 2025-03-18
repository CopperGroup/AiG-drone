import mongoose from "mongoose";

const filterSchema = new mongoose.Schema({
    categories: [
        {
            categoryId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Category"
            },
            params: [
                {
                    name: {
                        type: String
                    },
                    totalProducts: {
                        type: Number
                    },
                    type: {
                        type: String
                    }
                }
            ]
        }
    ],
    delay: {
        type: Number,
        default: 200
    }
})

const Filter = mongoose.models.Filter || mongoose.model("Filter", filterSchema);

export default Filter;