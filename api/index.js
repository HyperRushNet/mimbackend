let signals = {}; 
let readSignals = {}; 

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      let signalData;
      
      try {
        // Gebruik standaard Next.js JSON-parsing
        signalData = req.body;
      } catch (err) {
        console.error("❌ JSON Parsing Error:", err);
        return res.status(400).json({ error: 'Ongeldige JSON in verzoek' });
      }

      const { peerId, message } = signalData;

      if (!peerId || !message) {
        return res.status(400).json({ error: 'peerId en message zijn vereist' });
      }

      if (!signals[peerId]) {
        signals[peerId] = [];
      }

      // Zorg ervoor dat emoji's correct worden opgeslagen
      const signalId = Date.now() + Math.random().toString(36).substr(2, 9);
      const newSignal = { id: signalId, message: message.toString(), ...signalData };

      signals[peerId].push(newSignal);
      console.log(`✅ Signal ontvangen voor ${peerId}: `, newSignal);

      setTimeout(() => {
        if (signals[peerId]) {
          signals[peerId] = signals[peerId].filter(msg => msg.id !== signalId);
          console.log(`⏳ Bericht ${signalId} voor ${peerId} verwijderd.`);
        }
      }, 3000);

      return res.status(200).json({ message: 'Signal ontvangen', data: newSignal });
    }

    if (req.method === 'GET') {
      const { peerId, userId } = req.query;

      if (!peerId || !userId) {
        return res.status(400).json({ error: '?peerId= en ?userId= zijn vereist' });
      }

      if (!signals[peerId] || signals[peerId].length === 0) {
        return res.status(200).json({ message: 'Geen signalen voor deze peer' });
      }

      if (!readSignals[userId]) {
        readSignals[userId] = {};
      }
      if (!readSignals[userId][peerId]) {
        readSignals[userId][peerId] = new Set();
      }

      const unreadSignals = signals[peerId].filter(
        (signal) => !readSignals[userId][peerId].has(signal.id)
      );

      unreadSignals.forEach((signal) => readSignals[userId][peerId].add(signal.id));

      return res.status(200).json({ signals: unreadSignals });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('❌ Server error:', error);
    return res.status(500).json({ error: 'Interne serverfout' });
  }
}
