// Proxy serverless: obtiene los pitchers abridores probables de MLB para hoy desde la API
// pública de ESPN (no requiere API key). Devuelve un mapa por nombre de equipo con el pitcher
// probable y su ERA/WHIP específico de la temporada, para usarlo en el modelo de picks.

const TEAM_NAME_MAP = {
  'Arizona Diamondbacks':'Arizona Diamondbacks','Atlanta Braves':'Atlanta Braves',
  'Baltimore Orioles':'Baltimore Orioles','Boston Red Sox':'Boston Red Sox',
  'Chicago Cubs':'Chicago Cubs','Chicago White Sox':'Chicago White Sox',
  'Cincinnati Reds':'Cincinnati Reds','Cleveland Guardians':'Cleveland Guardians',
  'Colorado Rockies':'Colorado Rockies','Detroit Tigers':'Detroit Tigers',
  'Houston Astros':'Houston Astros','Kansas City Royals':'Kansas City Royals',
  'Los Angeles Angels':'Los Angeles Angels','Los Angeles Dodgers':'Los Angeles Dodgers',
  'Miami Marlins':'Miami Marlins','Milwaukee Brewers':'Milwaukee Brewers',
  'Minnesota Twins':'Minnesota Twins','New York Mets':'New York Mets',
  'New York Yankees':'New York Yankees','Athletics':'Athletics',
  'Philadelphia Phillies':'Philadelphia Phillies','Pittsburgh Pirates':'Pittsburgh Pirates',
  'San Diego Padres':'San Diego Padres','San Francisco Giants':'San Francisco Giants',
  'Seattle Mariners':'Seattle Mariners','St. Louis Cardinals':'St. Louis Cardinals',
  'Tampa Bay Rays':'Tampa Bay Rays','Texas Rangers':'Texas Rangers',
  'Toronto Blue Jays':'Toronto Blue Jays','Washington Nationals':'Washington Nationals'
};

function extractEra(statSplits){
  const cat = (statSplits||[]).find(c=>c.abbreviation==='ERA');
  return cat ? cat.value : null;
}
function extractWhip(statSplits){
  const cat = (statSplits||[]).find(c=>c.abbreviation==='WHIP');
  return cat ? cat.value : null;
}

export default async function handler(req, res) {
  try {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth()+1).padStart(2,'0');
    const dd = String(today.getDate()).padStart(2,'0');
    const dateStr = `${yyyy}${mm}${dd}`;

    const scoreboardRes = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard?dates=${dateStr}`
    );
    if (!scoreboardRes.ok) {
      res.status(502).json({ error: 'No se pudo obtener el scoreboard de ESPN' });
      return;
    }
    const scoreboard = await scoreboardRes.json();
    const events = scoreboard.events || [];

    const summaries = await Promise.all(
      events.map(ev =>
        fetch(`https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/summary?event=${ev.id}`)
          .then(r => r.ok ? r.json() : null)
          .catch(() => null)
      )
    );

    const pitchers = {}; // { 'Team Name': { name, era, whip } }
    summaries.forEach(s => {
      if (!s || !s.header) return;
      const comps = s.header.competitions?.[0]?.competitors || [];
      comps.forEach(c => {
        const teamName = c.team?.displayName;
        const probable = c.probables?.[0];
        if (!teamName || !probable) return;
        const era = extractEra(probable.statistics?.splits?.categories);
        const whip = extractWhip(probable.statistics?.splits?.categories);
        pitchers[teamName] = {
          name: probable.athlete?.displayName || null,
          era, whip
        };
      });
    });

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=1800'); // cache 1h
    res.status(200).json({ pitchers, count: Object.keys(pitchers).length });
  } catch (err) {
    res.status(500).json({ error: 'Fallo al conectar con ESPN', detail: String(err) });
  }
}
