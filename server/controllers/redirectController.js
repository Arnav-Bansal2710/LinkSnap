const db = require('../config/db');
const bcrypt = require('bcrypt');

const trackClick = async (urlId, req) => {
  try {
    const userAgent = req.headers['user-agent'] || '';
    const referrer  = req.headers['referer'] || 'Direct';

    let browser = 'Other';
    if (userAgent.includes('Chrome'))  browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari'))  browser = 'Safari';
    else if (userAgent.includes('Edge'))    browser = 'Edge';

    let device = 'Desktop';
    if (/mobile/i.test(userAgent))  device = 'Mobile';
    else if (/tablet/i.test(userAgent)) device = 'Tablet';

    let os = 'Other';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac'))    os = 'macOS';
    else if (userAgent.includes('Linux'))  os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS'))    os = 'iOS';

    await db.query(
      `INSERT INTO clicks (url_id, browser, device, os, referrer)
       VALUES (?, ?, ?, ?, ?)`,
      [urlId, browser, device, os, referrer]
    );

    await db.query(
      'UPDATE urls SET clicks = clicks + 1 WHERE id = ?',
      [urlId]
    );

  } catch (err) {
    console.error('Click tracking error:', err.message);
  }
};

const handleRedirect = async (req, res) => {
  const { code } = req.params;

  try {
    const [urls] = await db.query(
      `SELECT * FROM urls
       WHERE short_code = ? AND is_active = 1`,
      [code]
    );

    if (urls.length === 0) {
      return res.status(404).json({ message: 'Link not found or inactive' });
    }

    const url = urls[0];

    if (url.expires_at && new Date() > new Date(url.expires_at)) {
      return res.status(410).json({ message: 'This link has expired' });
    }

    if (url.password) {
      const acceptsHtml = req.headers.accept?.includes('text/html');

      if (acceptsHtml) {
        return res.redirect(
          `${process.env.CLIENT_URL}/protected/${code}`
        );
      }
      return res.status(401).json({
        message:'Password required',
        requiresPassword: true,
        short_code:       code
      });
    }

    trackClick(url.id, req);

    return res.redirect(301, url.original_url);

  } catch (err) {
    console.error('Redirect error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const verifyPassword = async (req, res) => {
  const { code }     = req.params;
  const { password } = req.body;

  try {
    const [urls] = await db.query(
      `SELECT * FROM urls
       WHERE short_code = ? AND is_active = 1`,
      [code]
    );

    if (urls.length === 0) {
      return res.status(404).json({ message: 'Link not found' });
    }

    const url = urls[0];

    if (url.expires_at && new Date() > new Date(url.expires_at)) {
      return res.status(410).json({ message: 'Link has expired' });
    }

    const isMatch = await bcrypt.compare(password, url.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    trackClick(url.id, req);

    res.json({ original_url: url.original_url });

  } catch (err) {
    console.error('Password verify error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { trackClick, handleRedirect, verifyPassword };