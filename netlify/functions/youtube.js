
exports.handler = async function () {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = "UC40YkXs92jrA7uXbsSqmMyQ";

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API key missing" })
    };
  }

  try {
    const url = new URL(
      "https://www.googleapis.com/youtube/v3/search"
    );

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

    const videos = (data.items || []).map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high.url
    }));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300"
      },
      body: JSON.stringify(videos)
		};
   } catch (error) {
  console.error("YouTube API ERROR:", error.message);
  return {
      statusCode: 500,
      body: JSON.stringify({ error: "Unable to load videos" })
    };
  }
};
