// Proxy serverless: oculta la API key y reenvía la petición de futures (outrights) a The Odds API
// Variable de entorno requerida en Vercel: ODDS_API_KEY

const FUTURES_KEYS = {
  MLB: 'baseball_mlb_world_series_winner',
  NFL: 'americanfootball_nfl_super_bowl_winner',
  NBA: 'basketball_nba_championship_winner'
};

export default async function handler(req, res) {
  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'ODDS_API_KEY no configurada en Vercel' });
    return;
  }

  const sportParam = (req.query.sport || 'MLB').toUpperCase();
  const sportKey = FUTURES_KEYS[sportParam];
  if (!sportKey) {
    res.status(400).json({ error: `Futures no soportados para: ${sportParam}` });
    return;
  }

  const url = `https://api.the-odds-api.com/v4/sports/${sportKey}/odds/?apiKey=${apiKey}&regions=us&markets=outrights&oddsFormat=american`;

  try {
    const apiRes = await fetch(url);
    const remaining = apiRes.headers.get('x-requests-remaining');
    const used = apiRes.headers.get('x-requests-used');

    if (!apiRes.ok) {
      const text = await apiRes.text();
      res.status(apiRes.status).json({ error: 'Error de The Odds API', detail: text });
      return;
    }

    const data = await apiRes.json();
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=1800'); // cache 1h, cambia poco
    res.status(200).json({ games: data, requestsRemaining: remaining, requestsUsed: used });
  } catch (err) {
    res.status(500).json({ error: 'Fallo al conectar con The Odds API', detail: String(err) });
  }
}
