import { NextResponse } from 'next/server';
import { removeAuthCookie } from '@/lib/auth';

async function handleLogout() {
  try {
    await removeAuthCookie();
    
    // Redirect to home page
    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    // Clear cookies explicitly if needed
    response.cookies.set('token', '', { maxAge: 0, path: '/' });
    return response;
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json({ success: false, message: 'Failed to logout' }, { status: 500 });
  }
}

export async function POST() {
  return handleLogout();
}

export async function GET() {
  return handleLogout();
}
