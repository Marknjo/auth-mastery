import NextAuth from 'next-auth';
import authConfig from '@/auth.config';

import {
  DEFAUTL_LOGIN_REDIRECT,
  authRoutes,
  apiAuthPrefix,
  publicRoutes,
} from '@/middleware.routes';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  console.log('\n🚩🚩 middleware');

  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isAPiAuthPrefix = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (isAPiAuthPrefix) return null;

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAUTL_LOGIN_REDIRECT, nextUrl));
    }
    return null;
  }

  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL('/auth/login', nextUrl));
  }

  return null;
});

// Optionally, don't invoke Middleware on some paths
// Read more: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
