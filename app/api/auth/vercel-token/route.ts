// app/api/vercel-token/route.ts

import { NextResponse } from 'next/server';
import axios from 'axios';
import User from '@/lib/models/user.model';
import { URLSearchParams } from 'url';
import { getSession } from 'next-auth/react';

export async function POST(req: Request) {
  const { code, email } = await req.json(); // Get the code from the frontend

  // Fetch the access token from Vercel API
  try {
    const response = await axios.post(
      'https://api.vercel.com/v2/oauth/access_token',
      new URLSearchParams({
        code,
        client_id: process.env.VERCEL_CLIENT_ID || '', // Vercel client ID
        client_secret: process.env.VERCEL_CLIENT_SECRET || '', // Vercel client secret
        redirect_uri: `http://localhost:3000/api/auth/vercel-callback`, // The redirect URL from your Vercel integration
      })
    );

    const { access_token } = response.data;

    // const verifyResponse = await axios.get('https://api.vercel.com/v2/user', {
    //     headers: { Authorization: `Bearer ${access_token}` },
    // });

    // console.log(verifyResponse.data)

    await User.findOneAndUpdate(
        { email },
        {
            vercelAccessToken: access_token
        },
    )
    return NextResponse.json({ access_token });
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    return NextResponse.json({ error: 'Failed to exchange code for token' }, { status: 500 });
  }
}
