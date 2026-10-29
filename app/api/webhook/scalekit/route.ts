import { db } from "@/db/client";
import { teamMembers } from "@/db/schema";
import scalekit from "@/lib/scalekit";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headers = Object.fromEntries(req.headers.entries());

    const secret = process.env.SCALEKIT_WEBHOOK_SECRET;
    if (!secret) {
      console.error("SCALEKIT_WEBHOOK_SECRET is not set");
      return NextResponse.json(
        { error: "Webhook not configured" },
        { status: 500 }
      );
    }

    try {
      scalekit.verifyWebhookPayload(secret, headers, body);
    } catch (error) {
      console.error("Webhook verification failed:", error);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);

    switch (event.type) {
      case "user.organization_membership_created": {
        const email = event.data?.user?.email;

        if (email) {
          await db
            .update(teamMembers)
            .set({ status: "active" })
            .where(eq(teamMembers.user_email, String(email).toLowerCase()));
        }
        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to process webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}