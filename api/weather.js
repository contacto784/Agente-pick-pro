// Proxy serverless: clima actual en el estadio de cada equipo MLB, vía Open-Meteo (gratis,
// sin API key, sin límite de costo para este volumen). Usado para ajustar la proyección de
// totales: viento soplando hacia el jardín (out) sube carreras esperadas, viento en contra
// (in) las baja. Estadios con techo (domo/retráctil cerrado) no se ven afectados por clima.

// ADVERTENCIA: las orientaciones (grados hacia el jardín central) son aproximaciones basadas en
// geografía general de cada estadio, no medidas oficiales verificadas una por una. El efecto de
// viento se usa como ajuste MENOR en el modelo (no dominante), precisamente por esta incertidumbre.
const STADIUM_COORDS = {
  'Boston Red Sox': { lat: 42.3467, lon: -71.0972, orientation: 45, roof: false },
  'New York Yankees': { lat: 40.8296, lon: -73.9262, orientation: 75, roof: false },
  'Tampa Bay Rays': { lat: 27.7683, lon: -82.6534, orientation: 0, roof: true },
  'Toronto Blue Jays': { lat: 43.6414, lon: -79.3894, orientation: 0, roof: true },
  'Baltimore Orioles': { lat: 39.2839, lon: -76.6217, orientation: 32, roof: false },
  'Cleveland Guardians': { lat: 41.4962, lon: -81.6852, orientation: 0, roof: false },
  'Minnesota Twins': { lat: 44.9817, lon: -93.2776, orientation: 90, roof: false },
  'Detroit Tigers': { lat: 42.3390, lon: -83.0485, orientation: 130, roof: false },
  'Kansas City Royals': { lat: 39.0517, lon: -94.4803, orientation: 45, roof: false },
  'Chicago White Sox': { lat: 41.8299, lon: -87.6338, orientation: 135, roof: false },
  'Houston Astros': { lat: 29.7570, lon: -95.3555, orientation: 0, roof: true },
  'Seattle Mariners': { lat: 47.5914, lon: -122.3325, orientation: 45, roof: true },
  'Texas Rangers': { lat: 32.7473, lon: -97.0945, orientation: 30, roof: true },
  'Los Angeles Angels': { lat: 33.8003, lon: -117.8827, orientation: 30, roof: false },
  'Athletics': { lat: 37.7516, lon: -122.2005, orientation: 65, roof: false },
  'Atlanta Braves': { lat: 33.8908, lon: -84.4678, orientation: 35, roof: false },
  'Philadelphia Phillies': { lat: 39.9061, lon: -75.1665, orientation: 5, roof: false },
  'New York Mets': { lat: 40.7571, lon: -73.8458, orientation: 30, roof: false },
  'Miami Marlins': { lat: 25.7781, lon: -80.2197, orientation: 0, roof: true },
  'Washington Nationals': { lat: 38.8730, lon: -77.0074, orientation: 30, roof: false },
  'Cincinnati Reds': { lat: 39.0974, lon: -84.5071, orientation: 90, roof: false },
  'Milwaukee Brewers': { lat: 43.0280, lon: -87.9712, orientation: 0, roof: true },
  'Chicago Cubs': { lat: 41.9484, lon: -87.6553, orientation: 35, roof: false },
  'St. Louis Cardinals': { lat: 38.6226, lon: -90.1928, orientation: 90, roof: false },
  'Pittsburgh Pirates': { lat: 40.4469, lon: -80.0057, orientation: 110, roof: false },
  'Los Angeles Dodgers': { lat: 34.0739, lon: -118.2400, orientation: 25, roof: false },
  'San Diego Padres': { lat: 32.7073, lon: -117.1566, orientation: 15, roof: false },
  'Arizona Diamondbacks': { lat: 33.4453, lon: -112.0667, orientation: 0, roof: true },
  'San Francisco Giants': { lat: 37.7786, lon: -122.3893, orientation: 95, roof: false },
  'Colorado Rockies': { lat: 39.7559, lon: -104.9942, orientation: 30, roof: false }
};

export default async function handler(req, res) {
  const team = req.query.team;
  if (!team || !STADIUM_COORDS[team]) {
    res.status(400).json({ error: `Equipo no reconocido o sin coordenadas: ${team}` });
    return;
  }

  const stadium = STADIUM_COORDS[team];
  if (stadium.roof) {
    // Techo cerrado o domo: el clima exterior no afecta el juego
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=1800');
    res.status(200).json({ team, roof: true, windEffect: 'neutral', tempF: null, windMph: null });
    return;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${stadium.lat}&longitude=${stadium.lon}` +
      `&current=temperature_2m,wind_speed_10m,wind_direction_10m,precipitation` +
      `&temperature_unit=fahrenheit&wind_speed_unit=mph`;
    const apiRes = await fetch(url);
    if (!apiRes.ok) {
      res.status(502).json({ error: 'No se pudo obtener el clima de Open-Meteo' });
      return;
    }
    const data = await apiRes.json();
    const current = data.current || {};

    // ¿El viento sopla hacia el jardín central (out, sube HRs/carreras) o desde ahí (in, las baja)?
    // Comparamos la dirección del viento contra la orientación del home plate hacia el jardín central.
    const windDir = current.wind_direction_10m;
    const windSpeed = current.wind_speed_10m || 0;
    let windEffect = 'neutral';
    if (windSpeed >= 8 && windDir != null) {
      const diff = Math.abs(((windDir - stadium.orientation + 180) % 360) - 180);
      if (diff < 45) windEffect = 'out'; // viento soplando del plato hacia el jardín = ayuda al bateador
      else if (diff > 135) windEffect = 'in'; // viento soplando del jardín hacia el plato = frena la pelota
    }

    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=900'); // cache 30 min, clima cambia
    res.status(200).json({
      team, roof: false, windEffect,
      tempF: current.temperature_2m, windMph: windSpeed,
      precipitationMm: current.precipitation
    });
  } catch (err) {
    res.status(500).json({ error: 'Fallo al conectar con Open-Meteo', detail: String(err) });
  }
}
