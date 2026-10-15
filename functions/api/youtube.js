
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
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("channelId", channelId);
    url.searchParams.set("order", "date");
    url.searchParams.set("type", "video");
    url.searchParams.set("maxResults", "6");
    url.searchParams.set("key", apiKey);

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(JSON.stringify(data.error || data));
    }
console.log("YouTube API response:", JSON.stringify(data));
    const videos = (data.items || []).map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high.url
    }));

    return Response.json(videos, {
      headers: { "Cache-Control": "public, max-age=300" }
    });
  } catch (error) {
    console.error("YouTube API error:", error);
    return Response.json(
      { error: "Unable to load videos" },
      { status: 500 }
    );
  }
}
// JavaScript Document
