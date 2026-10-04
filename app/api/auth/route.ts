import scalekit from "@/lib/scalekit";
import crypto from "crypto";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const redirectUri = process.env.SCALEKIT_REDIRECT_URI;
    if (!redirectUri) {
      console.error("SCALEKIT_REDIRECT_URI is not set");
      return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 500 }
      );
    }

    const state = crypto.randomBytes(16).toString("hex");

    const authorizationUrl = await scalekit.getAuthorizationUrl(redirectUri, {
      scopes: ["openid", "profile", "email", "offline_access"],
      state,
    });

    const response = NextResponse.redirect(authorizationUrl);
    response.cookies.set("oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 10, // 10 minutes — plenty for a login round-trip
    });
    return response;
  } catch (error) {
    console.error("Failed to generate authorization URL:", error);
    return NextResponse.json(
      { error: "Failed to generate authorization URL" },
      { status: 500 }
    );
  }
}