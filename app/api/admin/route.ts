import { currentRole } from '@/lib/auth';
import { UserRole } from '@prisma/client';
import { NextResponse } from 'next/server';

export const GET = async () => {
  const role = await currentRole();

  if (role === UserRole.ADMIN) {
    return NextResponse.json(
      { message: 'Success! You can access this admin route' },
      { status: 200 }
    );
  }

  return NextResponse.json(
    { message: 'Access permission denied!' },
    { status: 403 }
  );
};
