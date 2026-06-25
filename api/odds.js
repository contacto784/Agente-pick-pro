// Proxy serverless: oculta la API key y reenvía la petición a The Odds API
// Variable de entorno requerida en Vercel: ODDS_API_KEY

const SPORT_KEYS = {
  NFL: 'americanfootball_nfl',
  NBA: 'basketball_nba',
  MLB: 'baseball_mlb',
  NHL: 'icehockey_nhl',
  SOC: 'soccer_epl'
};

export default async function handler(req, res) {
  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'ODDS_API_KEY no configurada en Vercel' });
    return;
  }

  const sportParam = (req.query.sport || 'NFL').toUpperCase();
  const sportKey = SPORT_KEYS[sportParam];
  if (!sportKey) {
    res.status(400).json({ error: `Liga no soportada: ${sportParam}` });
    return;
  }

  const url = `https://api.the-odds-api.com/v4/sports/${sportKey}/odds/?apiKey=${apiKey}&regions=us&markets=h2h,spreads,totals&oddsFormat=american&dateFormat=iso`;

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
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=300'); // cache 10 min
    res.status(200).json({ games: data, requestsRemaining: remaining, requestsUsed: used });
  } catch (err) {
    res.status(500).json({ error: 'Fallo al conectar con The Odds API', detail: String(err) });
  }
}
