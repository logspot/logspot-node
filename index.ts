const API_URL = "https://api.logspot.io";

/** Default reserved event name marking an event as revenue (server-default). */
const DEFAULT_REVENUE_EVENT_NAME = "Payment";

let sdkConfig: { secretKey: string };

const init = (config: { secretKey: string }) => {
  sdkConfig = config;
};

const track = async (data: {
  event: string;
  channel?: string;
  message?: string;
  notify?: boolean;
  userId?: string;
  /** Monetary value in MAJOR units (e.g. dollars). Marks the event as revenue. */
  value?: number;
  /** ISO-4217 currency code (e.g. "USD"). Send alongside `value`. */
  currency?: string;
  /** Source transaction id; re-sending the same id is deduped (idempotent). */
  externalId?: string;
  metadata?: Record<string, any>;
}) => {
  if (!sdkConfig || !sdkConfig.secretKey) {
    console.error(
      "Logspot - SDK not configured. You need to call: Logspot.init({secretKey: 'YOUR_SECRET_KEY'})"
    );
    return;
  }

  if (!data || !data.event) {
    console.error("Logspot - event parameter is required");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/track`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-logspot-sk": sdkConfig.secretKey,
      },
      body: JSON.stringify({
        name: data.event,
        channel: data.channel,
        message: data.message,
        notify: data.notify,
        ...(data.userId && { user_id: data.userId }),
        ...(data.value != null && { value: data.value }),
        ...(data.currency && { currency: data.currency }),
        ...(data.externalId && { external_id: data.externalId }),
        ...(data.metadata && { metadata: data.metadata }),
      }),
    });

    if (res.status !== 200) {
      const body = await res.json();
      console.debug("Logspot - ", body);
      return;
    }

    console.debug("Logspot - event tracked");
  } catch (err) {
    console.error("Logspot - could not track event", err);
  }
};

/**
 * Track a revenue event from your server. Thin wrapper over `track()` that emits
 * the reserved revenue event (default "Payment") with the monetary `amount` in
 * MAJOR units (e.g. dollars) and ISO-4217 `currency`. Pass `transactionId` (your
 * payment/charge id) for idempotency, and `userId` plus any extra props (which
 * become metadata) to attribute it.
 *
 * @example
 *   Logspot.revenue(29.99, {
 *     currency: "USD",
 *     transactionId: "ch_123",
 *     userId: "john@doe.com",
 *     plan: "pro",
 *   });
 */
const revenue = async (
  amount: number,
  options: {
    currency?: string;
    /** Override the reserved revenue event name (defaults to "Payment"). */
    event?: string;
    channel?: string;
    userId?: string;
    /** Source transaction id for idempotency (e.g. your Stripe charge id). */
    transactionId?: string;
    [key: string]: any;
  } = {}
) => {
  if (typeof amount !== "number" || !isFinite(amount) || amount < 0) {
    console.error("Logspot - revenue() requires a finite, non-negative amount");
    return;
  }
  const { currency, event, channel, userId, transactionId, ...metadata } =
    options;
  return track({
    // `||` not `??`: an empty-string event must fall back, not ship blank.
    event: event || DEFAULT_REVENUE_EVENT_NAME,
    channel,
    userId,
    value: amount,
    currency,
    externalId: transactionId,
    metadata,
  });
};

export default { init, track, revenue };
