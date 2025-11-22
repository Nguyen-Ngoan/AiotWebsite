import { NextResponse } from "next/server";

const USER = process.env.BASIC_AUTH_USER || "test";
const PASS = process.env.BASIC_AUTH_PASS || "1234";

export function middleware(req: Request) {
  const auth = req.headers.get("authorization");

  // Chưa có header Authorization → yêu cầu login
  if (!auth || !auth.startsWith("Basic ")) {
    return new Response("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Protected"',
      },
    });
  }

  // Decode thông tin user:pass
  const base64Credentials = auth.split(" ")[1];
  const [user, pass] = atob(base64Credentials).split(":");

  if (user === USER && pass === PASS) {
    return NextResponse.next();
  }

  // Sai password
  return new Response("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Protected"',
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt).*)"],
};
