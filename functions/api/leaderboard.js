
export async function onRequestGet(context) {
  try {
    const db = context.env.DB;

    if (!db) {
      throw new Error("D1 veritabani baglantisi eksik.");
    }

    const currentMonth = new Date().toISOString().slice(0, 7);

    // Yalnizca son 50 videodaki yorumlari say.
    const allTime = await db.prepare(`
      SELECT
        c.author_id,
        MAX(c.author_name) AS name,
        MAX(c.avatar) AS avatar,
        COUNT(*) AS comments
      FROM youtube_comments c
      INNER JOIN videos v
        ON v.video_id = c.video_id
      WHERE c.author_id != ?
      GROUP BY c.author_id
      ORDER BY comments DESC, name ASC
      LIMIT 20
    `).bind("UC40YkXs92jrA7uXbsSqmMyQ").all();

    // Son 50 videonun bu ay yayinlanan yorumlari.
    const monthly = await db.prepare(`
      SELECT
        c.author_id,
        MAX(c.author_name) AS name,
        MAX(c.avatar) AS avatar,
        COUNT(*) AS comments
      FROM youtube_comments c
      INNER JOIN videos v
        ON v.video_id = c.video_id
      WHERE substr(c.published_at, 1, 7) = ?
        AND c.author_id != ?
      GROUP BY c.author_id
      ORDER BY comments DESC, name ASC
      LIMIT 20
    `).bind(
      currentMonth,
      "UC40YkXs92jrA7uXbsSqmMyQ"
    ).all();

    const format = (rows) => rows.map(user => ({
      name: user.name,
      avatar: user.avatar,
      channelId: user.author_id,
      comments: user.comments
    }));

    return Response.json({
      leaderboard: format(allTime.results || []),
      monthlyLeaderboard: format(monthly.results || []),
      scannedComments: 0,
      nextPageToken: null
    }, {
      headers: {
        "Cache-Control": "no-store"
      }
    });

  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
