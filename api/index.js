let signals = {}; 

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST'); 
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); 

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const signalData = req.body;
      const { peerId } = signalData;

      if (!signals[peerId]) {
        signals[peerId] = []; // Zorg dat het een array is
      }

      signals[peerId].push(signalData); // Voeg het signaal toe aan de array

      console.log(`Signal ontvangen voor ${peerId}: `, signalData);

      res.status(200).json({ message: 'Signal opgeslagen', data: signalData });
    } catch (error) {
      res.status(500).json({ error: 'Fout bij het verwerken van signalen' });
    }
  } else if (req.method === 'GET') {
    try {
      const { peerId } = req.query;

      if (signals[peerId] && signals[peerId].length > 0) {
        res.status(200).json({ signals: signals[peerId] });
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
