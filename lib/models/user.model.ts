import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: { type: String },
    name: { type: String },
    surname: { type: String },
    email: { type: String, required: [true, "Please provide an email"], unique: true },
    phoneNumber: { type: String },
    password: { type: String, required: [true, "Please provide a password"] },
    
    githubId: { type: String, unique: true, sparse: true },
    githubUsername: { type: String },
    githubProfileUrl: { type: String },
    githubEmail: { type: String },
    githubAccessToken: { type: String },
    
    vercelAccessToken: { type: String},

    orders: [
        {
            order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
            createdAt: { type: Date }
        }
    ],
    totalOrders: { type: Number, default: 0 },
    favourite: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    discounts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Discount" }],
    role: { type: String, default: "User" },
    selfCreated: { type: Boolean, default: false },
    region: String,
    city: String,
    postalCode: String,
    street: String,
    isVerified: { type: Boolean, default: true },
    forgotPasswordToken: String,
    forgotPasswordTokenExpiry: Date,
    verifyToken: String,
    verifyTokenExpiry: Date,
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }]
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
