import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import { connectToDB } from "@/lib/mongoose";
import { getSession } from "@/lib/getServerSession";
import User from "@/lib/models/user.model";

export async function GET() {
    await connectToDB();

    const email = await getSession();
    const user = await User.findOne({ email });

    if (!user?.githubAccessToken) {
        return NextResponse.json({ error: "GitHub not connected" }, { status: 403 });
    }

    const octokit = new Octokit({ auth: user.githubAccessToken });

    try {
        const { data: repos } = await octokit.repos.listForAuthenticatedUser({
            visibility: "all", // Fetch public and private repos
            per_page: 100, // Max limit per request
        });

        return NextResponse.json({ repos });
    } catch (error) {
        console.error("🚨 Error fetching GitHub repos:", error);
        return NextResponse.json({ error: "Failed to fetch repositories" }, { status: 500 });
    }
}
