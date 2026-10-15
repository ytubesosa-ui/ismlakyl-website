
exports.handler = async function () {
  const clientId = process.env.KICK_CLIENT_ID;
  const clientSecret = process.env.KICK_CLIENT_SECRET;

  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store"
  };

  try {
    if (!clientId || !clientSecret) {
      throw new Error("Kick credentials missing");
    }

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
      throw new Error("Kick authentication failed: HTTP " + tokenResponse.status);
    }

    const tokenData = await tokenResponse.json();

    const response = await fetch(
      "https://api.kick.com/public/v1/channels?slug=ismlakyl-on-yt",
      {
        headers: {
          Authorization: "Bearer " + tokenData.access_token
        }
      }
    );

    if (!response.ok) {
      throw new Error("Kick API error: HTTP " + response.status);
}
    const data = await response.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
