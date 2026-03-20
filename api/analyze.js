export default async function handler(req, res) {
  // Pouze POST requesty
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Zkontroluj, že máme API klíč
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'Chybí ANTHROPIC_API_KEY v nastavení Vercelu.' });
  }

  const { messages, max_tokens } = req.body;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: max_tokens || 1500,
        messages
      })
    });

    const data = await response.json();
    return res.status(response.status).json(data);

  } catch (err) {
    return res.status(500).json({ error: 'Chyba při volání Anthropic API: ' + err.message });
  }
}
