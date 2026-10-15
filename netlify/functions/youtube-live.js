
exports.handler = async function () {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  const CHANNEL_ID = "UC40YkXs92jrA7uXbsSqmMyQ";

  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=60"
  };

  if (!API_KEY) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "YouTube API key missing" })
    };
  }

  try {
    const params = new URLSearchParams({
      part: "snippet",
      channelId: CHANNEL_ID,
      eventType: "live",
      type: "video",
      maxResults: "1",
      key: API_KEY
    });

    const response = await fetch(
      "https://www.googleapis.com/youtube/v3/search?" + params
    );

    if (!response.ok) {
      throw new Error("YouTube API error: " + response.status);
    }

    const data = await response.json();
    const video = data.items?.[0];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        live: Boolean(video),
        url: video
          ? "https://www.youtube.com/watch?v=" + video.id.videoId
          : "https://www.youtube.com/@ismlakyl/live"
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};

