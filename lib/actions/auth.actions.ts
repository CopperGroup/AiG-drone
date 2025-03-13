"use server";

import { cookies } from "next/headers";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

interface GitHubLoginResponse {
    url: string;
}

interface GitHubCallbackResponse {
    success: boolean;
    redirectUrl: string;
}

export async function handleGitHubLogin(): Promise<GitHubLoginResponse> {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = "http://localhost:3000/api/auth/callback";

    return {
        url: `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo user`,
    };
}

export async function handleGitHubCallback(code: string, email: string): Promise<GitHubCallbackResponse> {
    const res = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new URLSearchParams({
            client_id: process.env.GITHUB_CLIENT_ID!,
            client_secret: process.env.GITHUB_CLIENT_SECRET!,
            code,
        }),
    });

    const data = await res.json() as { access_token?: string };

    if (!data.access_token) {
        throw new Error("GitHub login failed");
    }

    const userRes = await fetch("https://api.github.com/user", {
        headers: { Authorization: `token ${data.access_token}` },
    });

    const githubUser = await userRes.json();

    if (!githubUser.id) throw new Error("Failed to fetch GitHub user data");

    connectToDB()

    let user = await User.findOne({ email });

    if (!user) {
        throw new Error("USer not found")
    }

    user.githubId = githubUser.id,
    user.githubUsername = githubUser.login,
    user.githubProfileUrl = githubUser.html_url,
    user.githubEmail = githubUser.email,
    user.githubAccessToken = data.access_token;

    await user.save();

    // cookies().set("github_token", data.access_token, { httpOnly: true });


    return {
        success: true,
        redirectUrl: process.env.NEXTAUTH_URL || "http://localhost:3000/admin/parse",
    };
}
