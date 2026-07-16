import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { createCustomerPortal } from "@/lib/lemonsqueezy";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user.lsCustomerId) {
      return NextResponse.json(
        { error: "No subscription found. Subscribe to Pro first." },
        { status: 400 }
      );
    }

    const url = await createCustomerPortal(user.lsCustomerId);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Portal error:", error);
    return NextResponse.json({ error: "Portal link failed" }, { status: 500 });
  }
}
