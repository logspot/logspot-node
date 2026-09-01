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
  /** Browser/device lineage id from @logspot/web (`Logspot.getAnonymousId()`),
   *  forwarded so a server-side event stitches to the visitor's anonymous history. */
  anonymousId?: string;
  /** Associate this event with a group/account (Segment `$groups` style). With
   *  groupType "company" (the default when groupId is set) the platform resolves
   *  and stamps the company on the event — no separate group() call needed. */
  groupId?: string;
  /** Group type for `groupId`; server default is "company". */
  groupType?: string;
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
        ...(data.anonymousId && { anonymous_id: data.anonymousId }),
        ...(data.groupId && { group_id: data.groupId }),
        ...(data.groupId && { group_type: data.groupType || "company" }),
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
    /** Browser anonymous id to attribute this revenue to a visitor. */
    anonymousId?: string;
    /** Account/company this revenue belongs to (Segment `$groups` style). */
    groupId?: string;
    /** Group type for `groupId`; server default is "company". */
    groupType?: string;
    /** Source transaction id for idempotency (e.g. your Stripe charge id). */
    transactionId?: string;
    [key: string]: any;
  } = {}
) => {
  if (typeof amount !== "number" || !isFinite(amount) || amount < 0) {
    console.error("Logspot - revenue() requires a finite, non-negative amount");
    return;
  }
  const {
    currency,
    event,
    channel,
    userId,
    anonymousId,
    groupId,
    groupType,
    transactionId,
    ...metadata
  } = options;
  return track({
    // `||` not `??`: an empty-string event must fall back, not ship blank.
    event: event || DEFAULT_REVENUE_EVENT_NAME,
    channel,
    userId,
    anonymousId,
    groupId,
    groupType,
    value: amount,
    currency,
    externalId: transactionId,
    metadata,
  });
};

/**
 * Associate a user and/or an anonymous visitor with a group (Segment `group()`).
 * Creates a durable membership without emitting an analytics event; for the
 * default `type: "company"` the platform also resolves/creates the company.
 * Provide `userId` and/or `anonymousId` — at least one is required.
 *
 * @example
 *   Logspot.group("acme.com", { userId: "john@acme.com", traits: { plan: "pro" } });
 */
const group = async (
  groupId: string,
  options: {
    /** Group type; defaults to "company" server-side. */
    type?: string;
    userId?: string;
    /** Browser anonymous id (from @logspot/web `getAnonymousId()`). */
    anonymousId?: string;
    traits?: Record<string, any>;
  } = {}
) => {
  if (!sdkConfig || !sdkConfig.secretKey) {
    console.error(
      "Logspot - SDK not configured. You need to call: Logspot.init({secretKey: 'YOUR_SECRET_KEY'})"
    );
    return;
  }

  if (!groupId) {
    console.error("Logspot - group() requires a groupId");
    return;
  }
  if (!options.userId && !options.anonymousId) {
    console.error("Logspot - group() requires a userId or anonymousId");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/group`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-logspot-sk": sdkConfig.secretKey,
      },
      body: JSON.stringify({
        group_id: groupId,
        type: options.type || "company",
        ...(options.userId && { user_id: options.userId }),
        ...(options.anonymousId && { anonymous_id: options.anonymousId }),
        ...(options.traits && { traits: options.traits }),
      }),
    });

    if (res.status !== 200) {
      const body = await res.json();
      console.debug("Logspot - ", body);
      return;
    }

    console.debug("Logspot - group associated");
  } catch (err) {
    console.error("Logspot - could not associate group", err);
  }
};

// Named exports so `module: NodeNext`/`node16` backend consumers resolve the
// members cleanly (`import * as Logspot` or `import { track } from ...`). The
// default export is kept for bundler/default-import users (e.g. the browser SDK
// pattern). This package is CJS with no `exports` map, so without the named
// bindings a NodeNext default import binds to the module object and members
// fail to resolve (TS2339) — see @logspot/node consumers in concord-platform.
export { init, track, revenue, group };
export default { init, track, revenue, group };
