
export async function onRequestGet(context) {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);

    const allTime = await context.env.DB.prepare(`
      SELECT author_id, MAX(author_name) AS name,
             MAX(avatar) AS avatar, COUNT(*) AS comments
      FROM youtube_comments
      GROUP BY author_id
      ORDER BY comments DESC
      LIMIT 20
    `).all();

    const monthly = await context.env.DB.prepare(`
      SELECT author_id, MAX(author_name) AS name,
             MAX(avatar) AS avatar, COUNT(*) AS comments
      FROM youtube_comments
      WHERE substr(published_at, 1, 7) = ?
      GROUP BY author_id
      ORDER BY comments DESC
      LIMIT 20
    `).bind(currentMonth).all();

    const format = (rows) => rows.map(user => ({
      name: user.name,
      avatar: user.avatar,
      channelId: user.author_id,
      comments: user.comments
    }));

    return Response.json({
      leaderboard: format(allTime.results),
      monthlyLeaderboard: format(monthly.results),
      scannedComments: 0,
      nextPageToken: null
    }, {
      headers: { "Cache-Control": "no-store" }
    });

  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

