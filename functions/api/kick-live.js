
export async function onRequestGet(context) {
  const clientId = context.env.KICK_CLIENT_ID;
  const clientSecret = context.env.KICK_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return Response.json(
      { error: "Kick credentials missing" },
      { status: 500 }
    );
  }

  try {
    const tokenResponse = await fetch(
      "https://id.kick.com/oauth/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: clientId,
          client_secret: clientSecret
        })
      }
    );

    if (!tokenResponse.ok) {
      throw new Error("Kick authentication failed");
    }

    const tokenData = await tokenResponse.json();

    const response = await fetch(
      "https://api.kick.com/public/v1/channels?slug=ismlakyl-on-yt",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error("Kick API error");
    }

    const data = await response.json();
    const channel = data.data?.[0];

    return Response.json({
      live: channel?.stream?.is_live === true,
      url: "https://kick.com/ismlakyl-on-yt"
    }, {
      headers: { "Cache-Control": "public, max-age=60" }
    });

  } catch (error) {
    console.error("Kick live error:", error);
    return Response.json(
      { error: "Unable to check Kick live status" },
      { status: 500 }
    );
  }
}
