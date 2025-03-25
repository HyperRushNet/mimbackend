// In-memory opslag voor berichten per peer
let signals = {}; 

export default async function handler(req, res) {
  // CORS-instellingen
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      const { peerId, userId, message, timestamp } = req.body;

      if (!peerId || !userId || !message) {
        return res.status(400).json({ error: 'peerId, userId en message zijn vereist' });
      }

      if (!signals[peerId]) {
        signals[peerId] = [];
      }

      const newMessage = { userId, message, timestamp: timestamp || new Date().toISOString() };
      signals[peerId].push(newMessage);

      setTimeout(() => {
        signals[peerId] = signals[peerId].filter(msg => msg !== newMessage);
      }, 100);

      return res.status(200).json({ message: 'Bericht ontvangen', data: newMessage });
    }

    if (req.method === 'GET') {
      const { peerId } = req.query;
      if (!peerId) {
        return res.status(400).json({ error: '?peerId= is vereist' });
      }

      return res.status(200).json({ signals: signals[peerId] || [] });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    return res.status(500).json({ error: 'Interne serverfout', details: error.message });
  }
}
