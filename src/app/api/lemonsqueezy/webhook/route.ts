import { NextResponse } from "next/server";
import { verifyWebhook, type WebhookEvent } from "@/lib/lemonsqueezy";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-signature") ?? "";

    if (!verifyWebhook(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event: WebhookEvent = JSON.parse(rawBody);
    const eventName = event.meta.event_name;

    // Handle subscription events
    if (
      eventName === "subscription_created" ||
      eventName === "subscription_updated" ||
      eventName === "subscription_cancelled" ||
      eventName === "order_created"
    ) {
      const attrs = event.data.attributes as Record<string, unknown>;
      const customData = event.meta.custom_data;
      const userEmail = attrs.user_email as string | undefined;
      const userId = customData?.user_id;
      const status = (attrs.status as string) ?? null;
      const customerId = (attrs.customer_id as string) ?? null;
      const variantId = (attrs.variant_id as string) ?? null;

      // Find user by custom_data user_id first, then by email
      let user = null;
      if (userId) {
        user = await prisma.user.findUnique({ where: { id: userId } });
      }
      if (!user && userEmail) {
        user = await prisma.user.findUnique({ where: { email: userEmail } });
      }

      if (user) {
        const renewsAt = attrs.renews_at ? new Date(attrs.renews_at as string) : null;
        const endsAt = attrs.ends_at ? new Date(attrs.ends_at as string) : null;

        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionStatus: status,
            lsCustomerId: customerId ?? user.lsCustomerId,
            subscriptionVariantId: variantId ?? user.subscriptionVariantId,
            subscriptionEndsAt: renewsAt ?? endsAt,
          },
        });

        console.log(`Webhook: Updated user ${user.email} — status: ${status}`);
      } else {
        console.warn(`Webhook: Could not find user for ${userId ?? userEmail}`);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
