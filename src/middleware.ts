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
  "/api/labs",
  "/api/labs/(.*)",
  "/view/(.*)",
  "/api/runbooks/(.*)/public",
  "/api/documents/(.*)/public",
]);

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth().protect();
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
