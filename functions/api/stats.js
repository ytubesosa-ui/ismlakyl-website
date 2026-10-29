export async function onRequestGet(context) {
  const apiKey = context.env.YOUTUBE_API_KEY;
  const channelId = "UC40YkXs92jrA7uXbsSqmMyQ";

  if (!apiKey) {
    return Response.json(
      { error: "API key missing" },
      { status: 500 }
    );
  }

  try {
    const url = new URL(
      "https://www.googleapis.com/youtube/v3/channels"
    );

    url.searchParams.set("part", "statistics");
    url.searchParams.set("id", channelId);
    url.searchParams.set("key", apiKey);

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || !data.items?.length) {
      throw new Error("YouTube statistics unavailable");
    }

    const stats = data.items[0].statistics;

    return Response.json({
      subscribers: stats.hiddenSubscriberCount
        ? null
        : Number(stats.subscriberCount),
      views: Number(stats.viewCount),
      videos: Number(stats.videoCount)
    }, {
      headers: {
        "Cache-Control": "public, max-age=3600"
      }
    });

  } catch (error) {
    console.error("Statistics API error:", error);

    return Response.json(
      { error: "Unable to load statistics" },
      { status: 500 }
    );
  }
}
