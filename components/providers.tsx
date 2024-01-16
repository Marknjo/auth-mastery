'use server';

import { auth } from '@/auth';
import { SessionProvider } from 'next-auth/react';

type ProvidersProps = {
  children: React.ReactNode;
};

async function Providers({ children }: ProvidersProps) {
  const session = await auth();

  return <SessionProvider session={session}>{children}</SessionProvider>;
}
export default Providers;
