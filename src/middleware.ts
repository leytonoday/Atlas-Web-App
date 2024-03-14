import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { IServerResponse, UserRole } from "./types";
import { PROD_API_BASE_URL, DEV_API_BASE_URL, API_COOKIE_NAME } from "@/data";

// Duplicated intentionally. For some reason, importing the one from ./utils causes some weird error.
export function getApiBaseUrl(): string {
  return process.env.NODE_ENV === "development"
    ? DEV_API_BASE_URL
    : PROD_API_BASE_URL;
}

/**
 * Gets the user's roles from the server. This is used to check if the user is an admin or not.
 * @param headers Authorization headers
 * @returns A list of role strings
 */
async function getUserRoles(headers: Headers): Promise<string[]> {
  const rolesResponse = await fetch(`${getApiBaseUrl()}/user/my-roles`, {
    headers,
  });
  const roles = ((await rolesResponse.json()) as IServerResponse)
    .data as string[];

  return roles;
}

/**
 * This middleware is used to check if the user is authenticated or not when accessing protected routes
 * @param request
 * @returns
 */
export async function middleware(request: NextRequest) {
  const atlasIdentityCookie = request.cookies.get(API_COOKIE_NAME);

  // If the cookie doesn't exist, redirect to the sign in page immediately
  if (!atlasIdentityCookie) {
    return NextResponse.rewrite(new URL("/auth/sign-in", request.url));
  }

  const headers = new Headers();
  headers.append(
    "Cookie",
    `${atlasIdentityCookie.name}=${atlasIdentityCookie.value}`,
  );

  try {
    const authResponse = await fetch(
      `${getApiBaseUrl()}/authentication/is-authenticated`,
      { headers },
    );

    // Fetch instead of axios, because next.js doesn't support axios
    const isAuthenticated = (await authResponse.json()) as IServerResponse;

    // If user not signed in, redirect to sign in page
    if (!isAuthenticated.data) {
      return NextResponse.rewrite(new URL("/auth/sign-in", request.url));
    }

    // If user going to admin route, check if the user is an admin. If not, redirect to 403
    if (request.nextUrl.pathname.startsWith("/admin")) {
      // Roles Check
      const roles = await getUserRoles(headers);

      // If the user is not an admin, redirect to 403
      if (!roles.includes(UserRole.Administrator)) {
        return NextResponse.rewrite(new URL("/403", request.url));
      }
    }

    // If the user is going to the checkout page, check if the user is an admin. If so, redirect to the admin page.
    // Admins cannot checkout
    if (request.nextUrl.pathname.startsWith("/product/checkout")) {
      // Roles Check
      const roles = await getUserRoles(headers);

      // If the user is an admin, redirect to the admin page
      if (roles.includes(UserRole.Administrator)) {
        return NextResponse.rewrite(new URL("/admin/plans", request.url));
      }
    }
  } catch (error) {
    console.error(error);
    return NextResponse.rewrite(new URL("/", request.url));
  }
}

// The middleware is only going to run on these routes
export const config = {
  matcher: [
    "/admin/:path*",
    "/account-settings/:path*",
    "/product/checkout/:path*",
  ],
};
