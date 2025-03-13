import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import { connectToDB } from "@/lib/mongoose";
import { getSession } from "@/lib/getServerSession";
import User from "@/lib/models/user.model";
import { Store } from "@/constants/store";
import { initializeAndPushToGit } from "@/lib/git";
import { createVercelProject } from "@/lib/vercel";
import { normalizeRepoName } from "@/lib/utils";

export async function POST() {
    await connectToDB();
    const email = await getSession();
    const user = await User.findOne({ email });

    if (!user?.githubAccessToken) {
        return NextResponse.json({ error: "GitHub not connected" }, { status: 403 });
    }

    const octokit = new Octokit({ auth: user.githubAccessToken });

    try {
        const repoName = normalizeRepoName(Store.name);
        const { data: repo } = await octokit.repos.createForAuthenticatedUser({
            name: repoName,
            private: false,
        });

        await initializeAndPushToGit(repo.clone_url, user.githubAccessToken);

        const projectInfo = await createVercelProject();

        return NextResponse.json({ repoUrl: repo.html_url, projectInfo });
    } catch (error: any) {
        console.error("🚨 GitHub push failed:", error);

        if (error.status === 422) {
            return NextResponse.json({ error: "Repository already exists" }, { status: 422 });
        }

        return NextResponse.json({ error: "Failed to push to GitHub", details: error }, { status: 500 });
    }
}
