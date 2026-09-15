import { clerkMiddleware } from "@clerk/nextjs/server";

// Dashboard and all routes are publicly accessible without authentication.
// Clerk context is still initialized for users who choose to sign in.
export default clerkMiddleware();

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
