const functions = require('firebase-functions');
const axios = require('axios');

// Example: proxy for Foursquare Places search
// This Cloud Function forwards requests to Foursquare and keeps the API key secret.

// Configuration: set the FOURSQUARE_API_KEY in functions config or Secret Manager
// Using functions.config() here (simple). For production, use Secret Manager.
const getFoursquareKey = () => {
  try {
    const key = functions.config().foursquare?.key;
    if (key) return key;
  } catch (e) {}
  // fallback to environment
  return process.env.FOURSQUARE_API_KEY || '';
};

exports.placesProxy = functions.https.onRequest(async (req, res) => {
  const { lat, lng, query, radius } = req.query;

  const foursquareKey = getFoursquareKey();
  if (!foursquareKey) {
    res.status(500).json({ error: 'Server misconfigured: FOURSQUARE API key missing' });
    return;
  }

  try {
    const url = `https://api.foursquare.com/v3/places/search`;
    const params = {
      ll: `${lat},${lng}`,
      query: query || '',
      radius: radius || 5000,
      limit: 20
    };

    const response = await axios.get(url, {
      params,
      headers: {
        Authorization: foursquareKey,
        Accept: 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error calling Foursquare:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error fetching places' });
  }
});
