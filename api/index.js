// In-memory opslag voor berichten per peer
let signals = {}; 
let readSignals = {}; // Houd bij welke berichten per peer door een gebruiker zijn gelezen

export default async function handler(req, res) {
  // Voeg CORS headers toe om verzoeken van andere domeinen toe te staan
  res.setHeader('Access-Control-Allow-Origin', '*'); // Dit staat verzoeken van elke domein toe
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
      const { channel } = signalData;

      if (!channel) {
        return res.status(400).json({ error: 'channel is vereist' });
      }

      // Zorg ervoor dat er een array bestaat voor deze channel
      if (!signals[channel]) {
        signals[channel] = [];
      }

      // Voeg het nieuwe bericht toe aan de lijst
      signals[channel].push(signalData);

      console.log(`Signal ontvangen voor ${channel}: `, signalData);

      res.status(200).json({ message: 'Signal ontvangen', data: signalData });
    } catch (error) {
      res.status(500).json({ error: 'Fout bij het verwerken van signalen' });
    }
  } else if (req.method === 'GET') {
    // Haal alle signalen op voor een bepaalde peer die nog niet door de gebruiker zijn gelezen
    try {
      const { channel, lobby } = req.query;

      if (!channel || !lobby) {
        return res.status(400).json({ error: '?c= en ?user= zijn vereist' });
      }

      if (signals[channel] && signals[channel].length > 0) {
        // Zorg ervoor dat er een lijst is van gelezen berichten per lobby
        if (!readSignals[lobby]) {
          readSignals[lobby] = {};
        }

        if (!readSignals[lobby][channel]) {
          readSignals[lobby][channel] = new Set();
        }

        // Filter alleen ongelezen berichten voor deze gebruiker
        const unreadSignals = signals[channel].filter(
          (signal) => !readSignals[lobby][channel].has(signal)
        );

        // Markeer deze berichten als gelezen voor deze gebruiker
        unreadSignals.forEach((signal) => readSignals[lobby][channel].add(signal));

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


