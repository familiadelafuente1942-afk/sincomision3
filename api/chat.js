export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { messages, system } = req.body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 300,
        system: system,
        messages: messages
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error('Anthropic error:', data.error);
      return res.status(500).json({ reply: 'Error de API: ' + data.error.message });
    }

    res.status(200).json({ reply: data.content?.[0]?.text ?? 'Sin respuesta.' });
  } catch (err) {
    console.error('Handler error:', err);
    res.status(500).json({ reply: 'Error de servidor.' });
  }
}
