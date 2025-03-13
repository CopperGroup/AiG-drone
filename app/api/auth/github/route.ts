import { handleGitHubLogin } from "@/lib/actions/auth.actions";
import { NextResponse } from "next/server";

export async function POST() {
    const loginUrl = await handleGitHubLogin();
    return NextResponse.json(loginUrl);
}
