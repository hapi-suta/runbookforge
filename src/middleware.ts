import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhook(.*)",
  "/training/(.*)",
  "/api/training/(.*)",
  "/api/labs/(.*)",
  "/view/(.*)",
  "/api/runbooks/(.*)/public",
  "/api/documents/(.*)/public",
]);

export default clerkMiddleware((auth, request) => {
  // Skip auth for public routes
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }
  
  auth().protect();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
