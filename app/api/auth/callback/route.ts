import { handleGitHubCallback } from "@/lib/actions/auth.actions";
import { getSession } from "@/lib/getServerSession";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");

    if (!code) {
        return NextResponse.json({ error: "Missing code" }, { status: 400 });
    }

    try {
        const email = await getSession();

        const { redirectUrl } = await handleGitHubCallback(code, email);
        return NextResponse.redirect(redirectUrl); // Use absolute URL
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
