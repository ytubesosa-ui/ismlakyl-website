
export async function onRequestGet(context) {
  const apiKey = context.env.YOUTUBE_API_KEY;
  const channelId = "UC40YkXs92jrA7uXbsSqmMyQ";

  if (!apiKey) {
    return Response.json({ error: "API key missing" }, { status: 500 });
  }

  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("channelId", channelId);
    url.searchParams.set("eventType", "live");
    url.searchParams.set("type", "video");
    url.searchParams.set("maxResults", "1");
    url.searchParams.set("key", apiKey);

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "YouTube API error");
    }

    const video = data.items?.[0];

    return Response.json({
      live: Boolean(video),
      url: video
        ? `https://www.youtube.com/watch?v=${video.id.videoId}`
        : null
    }, {
      headers: { "Cache-Control": "public, max-age=60" }
    });

  } catch (error) {
    console.error("YouTube live error:", error);
    return Response.json(
      { error: "Unable to check live status" },
      { status: 500 }
    );
  }
}

