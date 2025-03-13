import { connectToDB } from "@/lib/mongoose";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import User from "@/lib/models/user.model";
import { sendEmail } from "@/helpers/mailer";

export async function POST(request: NextRequest) {
    try {
        await connectToDB();

        // Parse the request body as JSON
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const savedUser = await User.findOne({ email: email }).select('_id');

        if (!savedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

    

        // Send verify token
        await sendEmail({ email, emailType: "RESET", userId: savedUser._id });

        return NextResponse.json({
            message: "Password reset email sent successfully",
            success: true,
            savedUser
        });

    } catch (error: any) {
        console.error(error); // Логування помилки
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}