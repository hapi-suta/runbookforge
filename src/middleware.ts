import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware((auth, request) => {
  const pathname = request.nextUrl.pathname;
  
  // Public routes - no auth required
  const publicPaths = [
    '/api/labs',
    '/api/training',
    '/api/webhook',
    '/training',
    '/view',
    '/sign-in',
    '/sign-up',
  ];
  
  // Check if current path starts with any public path
  const isPublic = pathname === '/' || 
    publicPaths.some(path => pathname.startsWith(path)) ||
    pathname.includes('/public');
  
  if (isPublic) {
    return NextResponse.next();
  }
  
  // Protected routes require auth
  auth().protect();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
