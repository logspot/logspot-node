import fetch from "node-fetch";

const API_URL = "https://api.logspot.io";

let sdkConfig: { secretKey: string };

const init = (config: { secretKey: string }) => {
  sdkConfig = config;
};

const track = async (data: {
  event: string;
  message?: string;
  notify?: boolean;
  userId?: string;
  metadata?: Record<string, any>;
}) => {
  if (!sdkConfig || !sdkConfig.secretKey) {
    console.error(
      "Logspot - SDK not configured. You need to call: Logspot.init({publicKey: 'YOUR_PUBLIC_KEY'})"
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
        message: data.message,
        notify: data.notify,
        ...(data.userId && { user_id: data.userId }),
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

export default { init, track };
