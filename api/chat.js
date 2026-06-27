// Proxy serverless: oculta la API key y reenvía la conversación a la API de Anthropic (Claude)
// Variable de entorno requerida en Vercel: ANTHROPIC_API_KEY

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY no configurada en Vercel' });
    return;
  }

  const { messages, context } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Falta el arreglo messages' });
    return;
  }

  const systemPrompt = `Eres el Agente de AgentePicks, un asistente de picks deportivos en español. Eres directo, conciso y conversacional. Hablas en español natural, sin formalismos innecesarios.

Contexto de picks y datos reales de hoy (úsalo para responder preguntas sobre picks, partidos o recomendaciones; si la pregunta no tiene que ver con esto, responde normal):
${context ? JSON.stringify(context).slice(0, 6000) : 'Sin datos de contexto disponibles en este momento.'}

Si te preguntan algo fuera de picks deportivos, responde normal como un asistente conversacional, sin forzar el tema de apuestas. Nunca des consejos financieros formales ni garantices resultados; los picks son análisis estadístico, no certezas.`;

  try {
    const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system: systemPrompt,
        messages: messages
      })
    });

    if (!apiRes.ok) {
      const text = await apiRes.text();
      res.status(apiRes.status).json({ error: 'Error de la API de Anthropic', detail: text });
      return;
    }

    const data = await apiRes.json();
    const reply = (data.content || []).map(b => b.text || '').join('').trim();
    res.status(200).json({ reply });
  } catch (err) {
    res.status(500).json({ error: 'Fallo al conectar con Anthropic', detail: String(err) });
  }
}
