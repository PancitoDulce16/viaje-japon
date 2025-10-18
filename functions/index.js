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

// Get AviationStack API Key from environment (Gen 2 Functions use process.env directly)
const getAviationStackKey = () => {
  return process.env.AVIATIONSTACK_API_KEY || '4374cea236b04a5bf7e6d0c7d2cbf676';
};

// Get FlightRadar24 API Key from environment
const getFlightRadar24Key = () => {
  return process.env.FLIGHTRADAR24_API_KEY || '0199f4f2-8886-737a-938b-25a28ebf36b2|5QAzk6kvHlvzqPknflfxFxCzuB7SsomJUjZ7Ry9rcc7fb9a0';
};

// Get LiteAPI Key from environment (Gen 2 Functions use process.env directly)
const getLiteAPIKey = () => {
  return process.env.LITEAPI_API_KEY || '1757d988-56b3-4b5a-9618-c7b5053ac3aa';
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

// ==============================
// ✈️ FLIGHTS PROXY (FlightRadar24)
// ==============================
exports.flightsProxy = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  const flightRadar24Key = getFlightRadar24Key();
  if (!flightRadar24Key) {
    res.status(500).json({ error: 'Server misconfigured: FlightRadar24 API key missing' });
    return;
  }

  try {
    const { flight_number } = req.query;

    if (!flight_number) {
      res.status(400).json({ error: 'Missing flight_number parameter' });
      return;
    }

    console.log('🔍 Flights proxy called with:', { flight_number });

    const url = 'https://api.flightradar24.com/common/v1/flight/list.json';
    const params = {
      query: flight_number,
      fetchBy: 'flight',
      page: 1,
      limit: 10,
      token: flightRadar24Key
    };

    console.log('📡 Calling FlightRadar24 API...');
    const response = await axios.get(url, { params });

    const flights = response.data?.result?.response?.data || [];
    console.log('✅ FlightRadar24 response received:', flights.length, 'flights');

    res.json({
      success: true,
      data: flights
    });
  } catch (error) {
    console.error('❌ Error calling FlightRadar24:', error.response ? error.response.data : error.message);
    res.status(500).json({
      error: 'Error fetching flight data',
      details: error.response ? error.response.data : error.message
    });
  }
});

// ==============================
// 🏨 HOTELS PROXY (LiteAPI)
// ==============================
exports.hotelsProxy = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, X-API-KEY');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  const liteAPIKey = getLiteAPIKey();
  if (!liteAPIKey) {
    res.status(500).json({ error: 'Server misconfigured: LiteAPI key missing' });
    return;
  }

  try {
    console.log('🔍 Hotels proxy called');

    const url = 'https://api.liteapi.travel/v3.0/hotel-search';

    console.log('📡 Calling LiteAPI...');
    const response = await axios.post(url, req.body, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': liteAPIKey
      }
    });

    console.log('✅ LiteAPI response received:', response.data?.data?.length || 0, 'hotels');
    res.json(response.data);
  } catch (error) {
    console.error('❌ Error calling LiteAPI:', error.response ? error.response.data : error.message);
    res.status(500).json({
      error: 'Error fetching hotel data',
      details: error.response ? error.response.data : error.message
    });
  }
});
