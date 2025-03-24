// In-memory opslag voor berichten per peer
let signals = {}; 

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

      res.status(200).json({ message: 'Signal ontvangen', data: signalData });
    } catch (error) {
      res.status(500).json({ error: 'Fout bij het verwerken van signalen' });
    }
  } else if (req.method === 'GET') {
    // Haal alle signalen op voor een bepaalde peer
    try {
      const { peerId } = req.query;

      if (!peerId) {
        return res.status(400).json({ error: 'peerId is vereist' });
      }

      if (signals[peerId] && signals[peerId].length > 0) {
        res.status(200).json({ signals: signals[peerId] }); // Stuur alle signalen terug
        // Optioneel: Verwijder de signalen na ophalen als ze slechts eenmalig nodig zijn
        // delete signals[peerId]; 
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
