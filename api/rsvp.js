const { getDb } = require('./_db');

const ALLOWED_ANSWERS = ['Yes, I will', 'Unfortunately, I cant :(', 'Ill tell you a bit later'];
const MAX_LEN = 300;

function clean(value) {
  return String(value || '').trim().slice(0, MAX_LEN);
}

module.exports = async function handler(req, res) {
  if (req.method === 'POST') {
    return handleCreate(req, res);
  }
  if (req.method === 'GET') {
    return handleList(req, res);
  }
  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
};

async function handleCreate(req, res) {
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const name = clean(body.name);
    const attending = clean(body.attending);
    const notes = clean(body.notes);

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!ALLOWED_ANSWERS.includes(attending)) {
      return res.status(400).json({ error: 'A valid attendance answer is required' });
    }

    const db = await getDb();
    await db.collection('rsvps').insertOne({
      name,
      attending,
      notes,
      createdAt: new Date(),
      userAgent: clean(req.headers['user-agent']),
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('RSVP create error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function handleList(req, res) {
  const adminKey = process.env.RSVP_ADMIN_KEY;
  if (!adminKey || req.query.key !== adminKey) {
    return res.status(404).json({ error: 'Not found' });
  }

  try {
    const db = await getDb();
    const rsvps = await db.collection('rsvps')
      .find({})
      .sort({ createdAt: -1 })
      .limit(500)
      .toArray();

    return res.status(200).json({ count: rsvps.length, rsvps });
  } catch (err) {
    console.error('RSVP list error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
