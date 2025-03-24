let signals = new Map(); // Opslag voor signalen per peer
let readSignals = new Map(); // Houd bij welke berichten per peer door een gebruiker zijn gelezen

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { peerId, username } = req.body;

      if (!peerId || !username) {
        return res.status(400).json({ error: 'peerId en username zijn vereist' });
      }

      if (!signals.has(peerId)) {
        signals.set(peerId, new Set());
      }

      // Voeg de gebruikersnaam toe aan de lijst
      signals.get(peerId).add(username);

      console.log(`Gebruiker ${username} toegevoegd aan ${peerId}`);

      // Verwijder de gebruikersnaam na 1 seconde
      setTimeout(() => {
        if (signals.has(peerId)) {
          signals.get(peerId).delete(username);
          if (signals.get(peerId).size === 0) {
            signals.delete(peerId);
          }
        }
        console.log(`Gebruiker ${username} verwijderd van ${peerId}`);
      }, 3000);

      res.status(200).json({ message: 'Gebruikersnaam ontvangen', username });
    } catch (error) {
      res.status(500).json({ error: 'Fout bij verwerken' });
    }
  } else if (req.method === 'GET') {
    try {
      const { peerId } = req.query;

      if (!peerId) {
        return res.status(400).json({ error: '?peerId= is vereist' });
      }

      const usernames = signals.has(peerId) ? Array.from(signals.get(peerId)) : [];

      res.status(200).json({ usernames });
    } catch (error) {
      res.status(500).json({ error: 'Fout bij ophalen' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
