const db = require('../config/db');
const generateShortCode = require('../utils/generateShortCode');
const bcrypt = require('bcrypt');

const shortenUrl = async (req, res) => {
  const {
    original_url,
    custom_alias,
    title,
    password,
    expires_at,
    is_public = true
  } = req.body;

  const userId = req.user.id;

  try {
    new URL(original_url);
  } catch {
    return res.status(400).json({ message: 'Invalid URL format' });
  }

  try {
    if (custom_alias) {
      const [existing] = await db.query(
        'SELECT id FROM urls WHERE custom_alias = ?',
        [custom_alias]
      );
      if (existing.length > 0) {
        return res.status(400).json({ message: 'Custom alias already taken' });
      }
    }

    let short_code;
    let isUnique = false;

    while (!isUnique) {
      short_code = custom_alias || generateShortCode();
      const [check] = await db.query(
        'SELECT id FROM urls WHERE short_code = ?', [short_code]
      );
      if (check.length === 0) isUnique = true;
    }

    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const [result] = await db.query(
      `INSERT INTO urls
       (user_id, original_url, short_code, custom_alias,
        title, is_public, password, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        original_url,
        short_code,
        custom_alias || null,
        title || null,
        is_public,
        hashedPassword,
        expires_at || null,
      ]
    );

    res.status(201).json({
      message: 'URL shortened successfully',
      url: {
        id:result.insertId,
        short_code,
        short_url:`${process.env.CLIENT_URL}/${short_code}`,
        original_url,
        title,
        is_public,
        expires_at,
      }
    });

  } catch (err) {
    console.error('Shorten error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserUrls = async (req, res) => {
  const userId = req.user.id;
  const { search, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = `
      SELECT
        u.id, u.short_code, u.original_url, u.title,
        u.is_public, u.expires_at, u.is_active, u.created_at,
        COUNT(c.id) as total_clicks
      FROM urls u
      LEFT JOIN clicks c ON c.url_id = u.id
      WHERE u.user_id = ?
    `;
    const params = [userId];

    if (search) {
      query += ` AND (u.title LIKE ? OR u.original_url LIKE ? OR u.short_code LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` GROUP BY u.id ORDER BY u.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [urls] = await db.query(query, params);

    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) as total FROM urls WHERE user_id = ?',
      [userId]
    );

    res.json({
      urls,
      pagination: {
        total,
        page:       parseInt(page),
        totalPages: Math.ceil(total / limit),
      }
    });

  } catch (err) {
    console.error('Get URLs error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteUrl = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const [urls] = await db.query(
      'SELECT id FROM urls WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (urls.length === 0) {
      return res.status(404).json({ message: 'URL not found' });
    }

    await db.query('DELETE FROM urls WHERE id = ?', [id]);
    res.json({ message: 'URL deleted successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const toggleUrl = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const [urls] = await db.query(
      'SELECT id, is_active FROM urls WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (urls.length === 0) {
      return res.status(404).json({ message: 'URL not found' });
    }

    const newStatus = !urls[0].is_active;
    await db.query('UPDATE urls SET is_active = ? WHERE id = ?', [newStatus, id]);

    res.json({
      message: `Link ${newStatus ? 'activated' : 'deactivated'}`,
      is_active: newStatus
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { shortenUrl, getUserUrls, deleteUrl, toggleUrl };