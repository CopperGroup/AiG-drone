import simpleGit from "simple-git";
import path from "path";
import fs from "fs-extra";
import { getSession } from "./getServerSession";
import User from "./models/user.model";
import { Store } from "@/constants/store";
import { connectToDB } from "./mongoose";
import { Octokit } from "@octokit/rest";
import { Vercel } from '@vercel/sdk';

async function removeGitFolder(localPath: string) {
    try {
        await fs.remove(path.join(localPath, ".git"));
        console.log("✅ Removed .git folder");
    } catch (err) {
        console.error("⚠️ Failed to remove .git folder", err);
    }
}

export async function initializeAndPushToGit(repoUrl: string, accessToken: string) {
    const localPath = path.resolve(process.cwd());
    const git = simpleGit(localPath);

    try {
        await removeGitFolder(localPath);
        await git.init();

        // Check if branch exists before creating it
        const branches = await git.branch();
        if (!branches.all.includes("main")) {
            await git.checkoutLocalBranch("main");
        } else {
            await git.checkout("main");
        }

        await git.add(".");
        await git.commit("Initial commit");

        // Set up remote
        const authRepoUrl = repoUrl.replace("https://", `https://${accessToken}@`);
        await git.addRemote("origin", authRepoUrl);

        await git.push(["--force", "-u", "origin", "main"]);
        console.log("✅ Successfully pushed to GitHub");
    } catch (error) {
        console.error("🚨 Git push failed:", error);
        throw new Error("Failed to push to GitHub");
    }
}

export async function getGitHubRepoId(repoName: string) {
    await connectToDB();

    const email = await getSession();
    const user = await User.findOne({ email });

    if (!user?.githubAccessToken) {
        throw new Error("GitHub not connected");
    }

    const octokit = new Octokit({ auth: user.githubAccessToken });

    try {
        const { data: repos } = await octokit.repos.listForAuthenticatedUser({
            visibility: "all",
            per_page: 100,
        });

        const repo = repos.find(r => r.name.toLowerCase() === repoName.toLowerCase());

        if (!repo) {
            throw new Error(`Repository '${repoName}' not found`);
        }

        return repo.id;
    } catch (error) {
        console.error("🚨 Error fetching GitHub repo:", error);
        throw new Error("Failed to fetch repository");
    }
}
  