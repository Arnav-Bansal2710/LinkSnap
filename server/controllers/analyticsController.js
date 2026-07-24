const db = require('../config/db');

const getUrlAnalytics = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const [urls] = await db.query(
      'SELECT * FROM urls WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (urls.length === 0) {
      return res.status(404).json({ message: 'URL not found' });
    }

    const url = urls[0];

    const [[{ total_clicks }]] = await db.query(
      'SELECT COUNT(*) as total_clicks FROM clicks WHERE url_id = ?',
      [id]
    );

    const [dailyClicks] = await db.query(
      `SELECT 
        DATE(clicked_at) as date,
        COUNT(*) as clicks
       FROM clicks
       WHERE url_id = ?
       AND clicked_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY DATE(clicked_at)
       ORDER BY date ASC`,
      [id]
    );

    const [browserStats] = await db.query(
      `SELECT browser, COUNT(*) as count
       FROM clicks WHERE url_id = ?
       GROUP BY browser ORDER BY count DESC`,
      [id]
    );

    const [deviceStats] = await db.query(
      `SELECT device, COUNT(*) as count
       FROM clicks WHERE url_id = ?
       GROUP BY device ORDER BY count DESC`,
      [id]
    );

    const [osStats] = await db.query(
      `SELECT os, COUNT(*) as count
       FROM clicks WHERE url_id = ?
       GROUP BY os ORDER BY count DESC`,
      [id]
    );

    const [referrerStats] = await db.query(
      `SELECT referrer, COUNT(*) as count
       FROM clicks WHERE url_id = ?
       GROUP BY referrer ORDER BY count DESC
       LIMIT 5`,
      [id]
    );

    const [[lastClick]] = await db.query(
      `SELECT clicked_at FROM clicks
       WHERE url_id = ?
       ORDER BY clicked_at DESC LIMIT 1`,
      [id]
    );

    res.json({
      url: {
        id:           url.id,
        short_code:   url.short_code,
        original_url: url.original_url,
        title:        url.title,
        created_at:   url.created_at,
        expires_at:   url.expires_at,
      },
      analytics: {
        total_clicks,
        last_clicked:  lastClick?.clicked_at || null,
        daily_clicks:  dailyClicks,
        browsers:      browserStats,
        devices:       deviceStats,
        os:            osStats,
        referrers:     referrerStats,
      }
    });

  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getDashboardStats = async (req, res) => {
  const userId = req.user.id;

  try {
    const [[{ total_links }]] = await db.query(
      'SELECT COUNT(*) as total_links FROM urls WHERE user_id = ?',
      [userId]
    );

    const [[{ total_clicks }]] = await db.query(
      `SELECT COUNT(*) as total_clicks
       FROM clicks c
       JOIN urls u ON u.id = c.url_id
       WHERE u.user_id = ?`,
      [userId]
    );

    const [[{ active_links }]] = await db.query(
      `SELECT COUNT(*) as active_links
       FROM urls WHERE user_id = ? AND is_active = 1`,
      [userId]
    );

    const [weeklyClicks] = await db.query(
      `SELECT
        DATE(c.clicked_at) as date,
        COUNT(*) as clicks
       FROM clicks c
       JOIN urls u ON u.id = c.url_id
       WHERE u.user_id = ?
       AND c.clicked_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY DATE(c.clicked_at)
       ORDER BY date ASC`,
      [userId]
    );

    const [topLinks] = await db.query(
      `SELECT
        u.id, u.short_code, u.title, u.original_url,
        COUNT(c.id) as clicks
       FROM urls u
       LEFT JOIN clicks c ON c.url_id = u.id
       WHERE u.user_id = ?
       GROUP BY u.id
       ORDER BY clicks DESC
       LIMIT 3`,
      [userId]
    );

    res.json({
      stats: {
        total_links,
        total_clicks,
        active_links,
      },
      weekly_clicks: weeklyClicks,
      top_links:     topLinks,
    });

  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getUrlAnalytics, getDashboardStats };