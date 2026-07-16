import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { createCheckout } from "@/lib/lemonsqueezy";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const variantId = process.env.LEMONSQUEEZY_PRO_VARIANT_ID;
    const appUrl = process.env.APP_URL ?? "http://localhost:3000";

    if (!variantId) {
      return NextResponse.json({ error: "Checkout not configured" }, { status: 500 });
    }

    const url = await createCheckout({
      userId: user.id,
      email: user.email,
      variantId,
      redirectUrl: `${appUrl}/dashboard`,
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
