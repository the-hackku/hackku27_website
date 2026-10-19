import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (request.nextUrl.pathname === "/signin") {
    if (!sessionCookie) {
      return NextResponse.next();
    }
  } else if (
    (request.nextUrl.pathname === "/register" ||
      request.nextUrl.pathname === "/profile") &&
    !sessionCookie
  ) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/signin", "/signup"],
};
