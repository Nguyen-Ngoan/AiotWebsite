import { NextRequest, NextResponse } from 'next/server';
import { isAdminFromBasicAuth } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization');
  return NextResponse.json({ isAdmin: isAdminFromBasicAuth(auth) });
}
