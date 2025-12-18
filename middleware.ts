import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard');
    const isOnApi = req.nextUrl.pathname.startsWith('/api');

    // Protect dashboard routes
    if (isOnDashboard && !isLoggedIn) {
        return NextResponse.redirect(new URL('/', req.url));
    }

    // Protect API routes (except auth routes)
    if (isOnApi && !isLoggedIn && !req.nextUrl.pathname.startsWith('/api/auth')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

