import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    cookieName: "authjs.session-token",
  });

  const pathname = req.nextUrl.pathname;

  // if (
  //   token &&
  //   pathname !== "/dashboard" &&
  //   pathname === `/u/${token.username}` &&
  //   !pathname.startsWith("/api/auth") &&
  //   !pathname.startsWith("/api/accept-messages") &&
  //   !pathname.startsWith("/api/get-messages") &&
  //   !pathname.startsWith("/api/send-message") &&
  //   !pathname.startsWith("/api/delete-message") &&
  //   !pathname.startsWith("/api/suggest-messages") &&
  //   !pathname.startsWith("/api/search") &&
  //   !pathname.startsWith("/api/friends") &&
  //   !pathname.startsWith("/api/notifications") &&
  //   !pathname.startsWith("/api/accept-request") &&
  //   !pathname.startsWith("/send-friend-request")
  // ) {
  //   return NextResponse.redirect(new URL("/dashboard", req.url));
  // }

  // if (
  // !token &&
  //   pathname !== "/" &&
  //   pathname !== "/sign-in" &&
  //   pathname !== "/sign-up" &&
  //   pathname !== "/forgot-password" &&
  //   pathname !== "/verify-forgot-password" &&
  //   pathname !== "/verify" &&
  //   !pathname.startsWith("/u") &&
  //   !pathname.startsWith("/api/auth") &&
  //   !pathname.startsWith("/api/check-username-unique") &&
  //   !pathname.startsWith("/api/forgot-password") &&
  //   !pathname.startsWith("/api/sign-up") &&
  //   !pathname.startsWith("/api/verify-forgot-password") &&
  //   !pathname.startsWith("/api/verifyCode") &&
  //   !pathname.startsWith("/api/send-message") &&
  //   !pathname.startsWith("/api/suggest-messages") &&
  //   !pathname.startsWith("/api/auth/session") &&
  //   !pathname.startsWith("/api/search") &&
  //   !pathname.startsWith("/api/friends") &&
  //   !pathname.startsWith("/api/notifications") &&
  //   !pathname.startsWith("/api/accept-request") &&
  //   !pathname.startsWith("/send-friend-request")
  // ) {
  //   return NextResponse.redirect(new URL("/sign-in", req.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
