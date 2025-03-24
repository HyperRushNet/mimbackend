// In-memory opslag voor berichten per peer
let signals = {}; 
let readSignals = {}; // Houd bij welke berichten per peer door een gebruiker zijn gelezen

export default async function handler(req, res) {
  // Voeg CORS headers toe om verzoeken van andere domeinen toe te staan
  res.setHeader('Access-Control-Allow-Origin', '*'); // Dit staat verzoeken van elk domein toe
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST'); // Sta GET en POST-methoden toe
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Sta de Content-Type header toe

  // Als de HTTP-methode OPTIONS is, geef dan een lege reactie terug
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    // Ontvang bericht van een peer
    try {
      const signalData = req.body;
      const { peerId } = signalData;

      if (!peerId) {
        return res.status(400).json({ error: 'peerId is vereist' });
      }

      // Zorg ervoor dat er een array bestaat voor deze peerId
      if (!signals[peerId]) {
        signals[peerId] = [];
      }

      // Voeg het nieuwe bericht toe aan de lijst
      signals[peerId].push(signalData);

      console.log(`Signal ontvangen voor ${peerId}: `, signalData);

      // Verwijder berichten na 1 seconde
      setTimeout(() => {
        // Verwijder de berichten voor deze peerId na 1 seconde
        if (signals[peerId]) {
          signals[peerId] = signals[peerId].filter(msg => msg !== signalData);
        }
        console.log(`Berichten voor ${peerId} zijn na 1 seconde verwijderd.`);
      }, 1000);

      res.status(200).json({ message: 'Signal ontvangen', data: signalData });
    } catch (error) {
      res.status(500).json({ error: 'Fout bij het verwerken van signalen' });
    }
  } else if (req.method === 'GET') {
    // Haal alle signalen op voor een bepaalde peer die nog niet door de gebruiker zijn gelezen
    try {
      const { peerId, userId } = req.query;

      if (!peerId || !userId) {
        return res.status(400).json({ error: '?peerId= en ?userId= zijn vereist' });
      }

      if (signals[peerId] && signals[peerId].length > 0) {
        // Zorg ervoor dat er een lijst is van gelezen berichten per userId
        if (!readSignals[userId]) {
          readSignals[userId] = {};
        }

        if (!readSignals[userId][peerId]) {
          readSignals[userId][peerId] = new Set();
        }

        // Filter alleen ongelezen berichten voor deze gebruiker
        const unreadSignals = signals[peerId].filter(
          (signal) => !readSignals[userId][peerId].has(signal)
        );

        // Markeer deze berichten als gelezen voor deze gebruiker
        unreadSignals.forEach((signal) => readSignals[userId][peerId].add(signal));

        res.status(200).json({ signals: unreadSignals });
      } else {
        res.status(200).json({ message: 'Geen signalen voor deze peer' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Fout bij het ophalen van signalen' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
