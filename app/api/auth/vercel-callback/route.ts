import { NextResponse } from 'next/server';
import { parse } from 'cookie';
import { getSession } from '@/lib/getServerSession';

export async function GET(req: Request) {
  const cookies = parse(req.headers.get('cookie') || '');
  const code = new URL(req.url).searchParams.get('code');
  const state = new URL(req.url).searchParams.get('state');

  // Check CSRF token from the cookies
  if (state !== cookies.latestCSRFToken) {
    return NextResponse.json({ error: 'CSRF validation failed' }, { status: 400 });
  }

  const email = await getSession()

  if(!email) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  // Your logic to handle OAuth code exchange
  const response = await fetch('http://localhost:3000/api/auth/vercel-token', {
    method: 'POST',
    body: JSON.stringify({ code, email}),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (data.error) {
    return NextResponse.json({ error: data.error }, { status: 500 });
  }

  return NextResponse.redirect(new URL('/', req.url));

}
