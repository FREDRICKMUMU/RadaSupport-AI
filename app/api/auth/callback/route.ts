import scalekit from "@/lib/scalekit";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { user as User } from "@/db/schema";
import { db } from "@/db/client";

async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      console.warn(`DB query failed (attempt ${i + 1}/${attempts}), retrying...`, err);
      await new Promise((r) => setTimeout(r, 300 * (i + 1)));
    }
  }
  throw lastError;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const error_description = searchParams.get("error_description");

  if (error) {
    console.error("ScaleKit returned an error:", error, error_description);
    return NextResponse.json({ error, error_description }, { status: 401 });
  }

  if (!code) {
    // No one should land here directly — send them back to the start instead
    // of showing a bare error (e.g. a stray refresh or bookmarked callback URL).
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    const redirectUri = process.env.SCALEKIT_REDIRECT_URI!;
    const authResult = await scalekit.authenticateWithCode(code, redirectUri);
    const { user, idToken } = authResult;

    if (!user?.email) {
      console.error("ScaleKit auth succeeded but no email was returned on user:", user);
      return NextResponse.json(
        { error: "No email returned from authentication provider" },
        { status: 500 }
      );
    }

    const claims = await scalekit.validateToken(idToken);

    // Debug log — remove once you've confirmed what ScaleKit actually sends back.
    console.log("ID token claims:", JSON.stringify(claims, null, 2));

    // ScaleKit sends the organization id under "oid".
    const organisationId = (claims as any).oid || null;

    if (!organisationId) {
      console.warn(
        "No organisation id found in token claims — continuing without one."
      );
    }

    const existing = await withRetry(() =>
      db.select().from(User).where(eq(User.email, user.email)).limit(1)
    );

    if (existing.length === 0) {
      await db.insert(User).values({
        name: user?.name || "anonymous",
        email: user.email,
        ...(organisationId ? { organizationId: organisationId } : {}),
      });
    }

    const response = NextResponse.redirect(new URL("/", req.url));

    const userSession = {
      email: user.email,
      organization_id: organisationId,
    };

    response.cookies.set("user_session", JSON.stringify(userSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return response;
  } catch (error) {
    console.error("Error exchanging code:", error);
    return NextResponse.json(
      { error: "Failed to authenticate user" },
      { status: 500 }
    );
  }
}