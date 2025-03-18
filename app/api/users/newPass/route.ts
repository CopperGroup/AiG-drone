import { connectToDB } from "@/lib/mongoose";
import { NextRequest, NextResponse } from "next/server";
import User from "@/lib/models/user.model";
import bcryptjs from "bcryptjs";


connectToDB();


export async function POST(request: NextRequest){

    try {
        const reqBody = await request.json()

        const token = reqBody.token
        const password = reqBody.password

    

        const user = await User.findOne({forgotPasswordToken: token,forgotPasswordTokenExpiry: {$gt: Date.now()}});

        if (!user) {
            return NextResponse.json({error: "Invalid token"}, {status: 400})
        }
      

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        
        user.forgotPasswordToken = undefined;
        user.forgotPasswordTokenExpiry = undefined;
        user.password = hashedPassword;
        user.role = 'Admin'

        await user.save();
        
        return NextResponse.json({
            message: "Password was changed successfully",
            success: true
        })


    } catch (error:any) {
        return NextResponse.json({error: error.message}, {status: 500})
    }

}