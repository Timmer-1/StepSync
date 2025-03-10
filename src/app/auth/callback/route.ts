import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (code) {
        const cookieStore = cookies();
        // Use the route handler client specifically designed for route handlers
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        // Exchange the code for a session
        await supabase.auth.exchangeCodeForSession(code);

        // Redirect to the home page or dashboard after successful authentication
        return NextResponse.redirect(new URL('/', requestUrl.origin));
    }

    // If there's no code, redirect to the login page
    return NextResponse.redirect(new URL('/auth/login', requestUrl.origin));
}