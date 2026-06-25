// Proxy serverless: oculta la API key de ClearSports y reenvia la peticion
// Variable de entorno requerida en Vercel: CLEARSPORTS_API_KEY

export default async function handler(req, res) {
  const apiKey = process.env.CLEARSPORTS_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'CLEARSPORTS_API_KEY no configurada en Vercel' });
    return;
  }

  try {
    const apiRes = await fetch('https://api.clearsportsapi.com/api/v1/mlb/team-stats', {
      headers: { Authorization: `Bearer ${apiKey}` }
    });

    if (!apiRes.ok) {
      const text = await apiRes.text();
      res.status(apiRes.status).json({ error: 'Error de ClearSports API', detail: text });
      return;
    }

    const data = await apiRes.json();
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=1800'); // cache 1 hora
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Fallo al conectar con ClearSports API', detail: String(err) });
  }
}
