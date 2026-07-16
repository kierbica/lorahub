import crypto from "crypto";

const LS_BASE = "https://api.lemonsqueezy.com/v1";

function headers() {
  return {
    Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
    Accept: "application/vnd.api+json",
    "Content-Type": "application/vnd.api+json",
  };
}

export async function createCheckout(input: {
  userId: string;
  email: string;
  variantId: string;
  redirectUrl: string;
}): Promise<string> {
  const res = await fetch(`${LS_BASE}/checkouts`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          redirect_url: input.redirectUrl,
          checkout_data: {
            email: input.email,
            custom: {
              user_id: input.userId,
            },
          },
        },
        relationships: {
          store: {
            data: {
              type: "stores",
              id: String(process.env.LEMONSQUEEZY_STORE_ID),
            },
          },
          variant: {
            data: {
              type: "variants",
              id: input.variantId,
            },
          },
        },
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Lemon Squeezy checkout failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.data.attributes.url;
}

export async function createCustomerPortal(
  customerId: string
): Promise<string> {
  const res = await fetch(
    `${LS_BASE}/customers/${customerId}/customer-portal-links`,
    {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ data: { type: "customer-portal-links", attributes: {} } }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Lemon Squeezy portal failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.data.attributes.url;
}

export function verifyWebhook(rawBody: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_SIGNING_SECRET;
  if (!secret) {
    console.warn("LEMONSQUEEZY_SIGNING_SECRET not set — skipping webhook verification");
    return true;
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signature)
  );
}

export interface WebhookEvent {
  meta: {
    event_name: string;
    custom_data?: Record<string, string>;
  };
  data: {
    id: string;
    type: string;
    attributes: Record<string, unknown>;
  };
}
