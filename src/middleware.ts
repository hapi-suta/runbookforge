import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhook(.*)",
  "/training/(.*)",
  "/api/training/access/(.*)",
  "/api/training/quiz/(.*)",
  "/api/training/submissions",
  "/api/training/content/(.*)",
  "/view/(.*)",
  "/api/runbooks/(.*)/public",
  "/api/documents/(.*)/public",
]);

export default clerkMiddleware((auth, request) => {
  const url = new URL(request.url);
  
  // Always allow labs API - students access without login
  if (url.pathname.startsWith('/api/labs')) {
    return;
  }
  
  if (!isPublicRoute(request)) {
    auth().protect();
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
