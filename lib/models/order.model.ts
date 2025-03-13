import mongoose from "mongoose";


const productSchema = new mongoose.Schema({
    id:{
        type:String,
    },

    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            },
            amount : {
                type: Number,
            }
        },
    ],
    
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    
    value: {
        type: Number
    },

    name: {
        type:String
    },

    surname: {
        type:String
    },

    phoneNumber: {
        type:String
    },

    email: {
        type:String
    },
    
    paymentType: {
        type:String
    },

    deliveryMethod: {
        type:String
    },

    city: {
        type:String
    },

    adress: {
        type:String
    },

    postalCode: {
        type: String
    },

    comment: {
        type:String
    },

    data: {
        type: Date,
        default: Date.now
    },

    paymentStatus: {
        type: String
    },

    deliveryStatus: {
        type: String
    }
})

const Order = mongoose.models.Order || mongoose.model("Order", productSchema);

export default Order;