import { connectToDB } from "@/lib/mongoose";
import User from "@/lib/models/user.model";
import { NextResponse } from "next/server";

const { v4: uuidv4 } = require('uuid');

export async function POST(request:any) {
  const { name, email } = await request.json();
  const username = name
  const password = uuidv4();
  await connectToDB();
  await User.create({ name, email, username, password });
  return NextResponse.json({ message: "User Registered" }, { status: 201 });
}
