

export async function onRequestGet(context) {
  const apiKey = context.env.YOUTUBE_API_KEY;
  const channelId = "UC40YkXs92jrA7uXbsSqmMyQ";

  if (!apiKey) {
    return Response.json({ error: "API key missing" }, { status: 500 });
  }

  try {
    const videoUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    videoUrl.searchParams.set("part", "snippet");
    videoUrl.searchParams.set("channelId", channelId);
    videoUrl.searchParams.set("type", "video");
    videoUrl.searchParams.set("order", "date");
    videoUrl.searchParams.set("maxResults", "50");
    const pageToken = new URL(context.request.url).searchParams.get("pageToken");
if (pageToken) videoUrl.searchParams.set("pageToken", pageToken);
    videoUrl.searchParams.set("key", apiKey);

    const videoResponse = await fetch(videoUrl);
    const videoData = await videoResponse.json();

    if (!videoResponse.ok) {
      throw new Error(videoData.error?.message || "Video API error");
    }

    const counts = new Map();   
    const monthlyCounts = new Map();
    const currentMonth = new Date().toISOString().slice(0, 7);
    let scannedComments = 0;

    for (const video of videoData.items || []) {
      const videoId = video.id?.videoId;
      if (!videoId) continue;

      const commentUrl = new URL(
        "https://www.googleapis.com/youtube/v3/commentThreads"
      );
      commentUrl.searchParams.set("part", "snippet");
      commentUrl.searchParams.set("videoId", videoId);
      commentUrl.searchParams.set("maxResults", "100");
      commentUrl.searchParams.set("textFormat", "plainText");
      commentUrl.searchParams.set("key", apiKey);

      const response = await fetch(commentUrl);
      const data = await response.json();

      if (!response.ok) {
        if (data.error?.errors?.some(e => e.reason === "commentsDisabled")) {
          continue;
        }
        throw new Error(data.error?.message || "Comments API error");
      }

      for (const thread of data.items || []) {
        const comment = thread.snippet?.topLevelComment?.snippet;
        const authorId = comment?.authorChannelId?.value;

        if (!authorId) continue;
        if (authorId === channelId) continue;

        const current = counts.get(authorId) || {
          name: comment.authorDisplayName,
          avatar: comment.authorProfileImageUrl,
          channelId: authorId,
          comments: 0
        };

        current.comments++;
        counts.set(authorId, current);
        if (comment.publishedAt?.slice(0, 7) === currentMonth) {
    const monthlyCurrent = monthlyCounts.get(authorId) || {
        name: comment.authorDisplayName,
        avatar: comment.authorProfileImageUrl,
        channelId: authorId,
        comments: 0
    };

    monthlyCurrent.comments++;
    monthlyCounts.set(authorId, monthlyCurrent);
}
        
await context.env.DB.prepare(
  `INSERT OR IGNORE INTO youtube_comments
  (comment_id, author_id, author_name, avatar, published_at, video_id)
  VALUES (?, ?, ?, ?, ?, ?)`
).bind(
  thread.id,
  authorId,
  comment.authorDisplayName,
  comment.authorProfileImageUrl,
  comment.publishedAt,
  videoId
).run();

        scannedComments++;
      }
    }
    const savedComments = await context.env.DB.prepare(
  "SELECT author_id, author_name, avatar, published_at FROM youtube_comments"
).all();
    const dbCounts = new Map();
const dbMonthlyCounts = new Map();

for (const comment of savedComments.results) {
  const authorId = comment.author_id;

  const user = dbCounts.get(authorId) || {
    name: comment.author_name,
    avatar: comment.avatar,
    channelId: authorId,
    comments: 0
  };
  user.comments++;
  dbCounts.set(authorId, user);

  if (comment.published_at?.slice(0, 7) === currentMonth) {
    const monthlyUser = dbMonthlyCounts.get(authorId) || {
      name: comment.author_name,
      avatar: comment.avatar,
      channelId: authorId,
      comments: 0
    };
    monthlyUser.comments++;
    dbMonthlyCounts.set(authorId, monthlyUser);
  }
}
const monthlyLeaderboard = [...dbMonthlyCounts.values()]    .sort((a, b) => b.comments - a.comments)
    .slice(0, 20);
const leaderboard = [...dbCounts.values()]      .sort((a, b) => b.comments - a.comments)
      .slice(0, 20);

    return Response.json({
      leaderboard,
      monthlyLeaderboard,
      scannedComments,
      nextPageToken: videoData.nextPageToken || null,
      note: "Her istekte en fazla 50 video taranır. Yorumlar D1 veritabanına kaydedilir."
    }, {
      headers: { "Cache-Control": "public, max-age=3600" }
    });

  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
