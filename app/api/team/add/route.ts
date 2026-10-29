import { db } from "@/db/client";
import { teamMembers } from "@/db/schema";
import { isAuthorized } from "@/lib/isAuthorized";
import scalekit from "@/lib/scalekit";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const loggedInUser = await isAuthorized();
    if (!loggedInUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = (loggedInUser as any).organizationId as
      | string
      | undefined;
    if (!organizationId) {
      return NextResponse.json(
        { error: "Your account has no organization" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const name = String(body.name ?? "").trim();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.user_email, email),
          eq(teamMembers.organization_id, organizationId)
        )
      );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "User is already invited" },
        { status: 400 }
      );
    }

    const displayName = name || email.split("@")[0];

    const { user: createdUser } = await scalekit.user.createUserAndMembership(
      organizationId,
      {
        email,
        userProfile: {
          firstName: displayName,
          lastName: "",
        },
        sendInvitationEmail: true,
      }
    );

    await db.insert(teamMembers).values({
      user_email: email,
      name: displayName,
      organization_id: organizationId,
    });

    return NextResponse.json({ user: createdUser });
  } catch (error) {
    console.error("Failed to add team member:", error);
    return NextResponse.json(
      { error: "Failed to add team member" },
      { status: 500 }
    );
  }
}