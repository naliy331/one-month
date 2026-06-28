module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Only POST requests are supported.' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  if (!apiKey) {
    res.status(500).json({ ok: false, error: 'Missing GEMINI_API_KEY in Vercel environment variables.' });
    return;
  }

  let body = {};
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  } catch (error) {
    res.status(400).json({ ok: false, error: 'Invalid JSON body.' });
    return;
  }

  const payload = body.gameState || body;
  const playerName = body.playerName || payload?.player?.name || '玩家';
  const summaryText = body.summary || buildSummaryText(payload);

  const systemPrompt = `你是《一個月的你》的結局生成引擎。請根據玩家的三天記錄，生成四段結局內容，語氣溫柔、細節具體、不要說教。請只回傳 JSON，格式如下：
{
  "layer1": "第1段文字",
  "layer2": "第2段文字",
  "layer3": "第3段文字",
  "layer4": "第4段文字",
  "mbtiTendency": "INFP傾向"
}
不要包裹在程式碼區塊中。`;

  const userPrompt = `玩家名稱：${playerName}\n\n玩家資料：\n${JSON.stringify(payload, null, 2)}\n\n摘要：\n${summaryText}`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: userPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.85,
          maxOutputTokens: 1200
        }
      })
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message = data?.error?.message || `Gemini API error: ${response.status}`;
      res.status(502).json({ ok: false, error: message });
      return;
    }

    const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();

    if (!text) {
      res.status(502).json({ ok: false, error: 'Gemini API returned no content.' });
      return;
    }

    const parsed = parseJson(text);

    if (parsed && typeof parsed === 'object') {
      res.status(200).json({ ok: true, result: parsed });
      return;
    }

    res.status(200).json({ ok: true, resultText: text });
  } catch (error) {
    console.error('generate-ending failed:', error);
    res.status(500).json({ ok: false, error: 'Failed to generate ending.' });
  }
};

function parseJson(text) {
  try {
    const cleaned = String(text || '').trim();
    const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const body = match ? match[1] : cleaned;
    return JSON.parse(body);
  } catch (error) {
    return null;
  }
}

function buildSummaryText(payload) {
  try {
    const player = payload?.player || {};
    const world = payload?.world || {};
    const logs = payload?.logs || {};
    const days = logs?.days || {};
    const dayList = Object.keys(days)
      .sort((a, b) => Number(a) - Number(b))
      .map((day) => {
        const turnList = days[day]?.turns || [];
        return `Day ${day}: ${turnList.length} 句對話，地點=${days[day]?.location || '未知'}`;
      });

    return [
      `玩家名字：${player.name || '未填'}`,
      `想練習：${player.practiceGoal || '未填'}`,
      `擔心：${(player.worries || []).join('、') || '未填'}`,
      `承諾：${(world.commitments || []).join('、') || '無'}`,
      `三天摘要：${dayList.join(' | ')}`
    ].join('\n');
  } catch (error) {
    return '無摘要';
  }
}
