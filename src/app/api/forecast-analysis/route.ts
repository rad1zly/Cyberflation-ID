import { NextRequest, NextResponse } from 'next/server';

const FIREWORKS_API_KEY = process.env.FIREWORKS_API_KEY || '';
const FIREWORKS_BASE_URL = process.env.FIREWORKS_BASE_URL || 'https://api.fireworks.ai/inference/v1';

export async function POST(req: NextRequest) {
  try {
    const { indexData, forecast, horizon } = await req.json();

    // Build concise forecast summary for prompt — round all numbers to avoid float precision issues
    const currentIndex = Math.round(indexData.index);
    const incidentScore = Math.round(indexData.components.incidentScore);
    const kevScore = Math.round(indexData.components.kevScore);
    const shodanScore = Math.round(indexData.components.shodanScore);
    const avgCVSS = Math.round(indexData.components.avgCVSS * 10) / 10;
    const gamblingScore = Math.round(indexData.gambling.score);
    const gamblingInfections = Math.round(indexData.gambling.activeInfections);

    // Extract forecast trajectory
    const predictedVals = forecast.filter((d: { predicted?: number }) => d.predicted !== undefined);
    const avgForecast = predictedVals.length > 0
      ? Math.round(predictedVals.reduce((s: number, d: { predicted: number }) => s + d.predicted, 0) / predictedVals.length)
      : currentIndex;
    const endForecast = predictedVals.length > 0
      ? Math.round(predictedVals[predictedVals.length - 1].predicted!)
      : currentIndex;
    const trend = predictedVals.length >= 2 ? Math.round(endForecast - currentIndex) : 0;

    const systemPrompt = `You are the AI Forecast Analyst for Cyberflation.ID — Indonesia's cyber risk early warning platform.

SCOPE — answer ONLY about:
- Cyber inflation / cyber risk forecasting in Indonesia
- Threat trajectory analysis and risk projections
- Sectoral risk breakdown and recommended mitigations
- Cyberflation.ID data interpretation

OUT OF SCOPE — decline politely if asked anything else.

DATA YOU HAVE:
- Current Cyber Inflation Index: ${currentIndex}/100 (${indexData.status})
- Incident Score: ${incidentScore}/100
- KEV Score: ${kevScore}/100
- Shodan Exposure Score: ${shodanScore}/100
- Average CVSS Severity: ${avgCVSS}/10
- Ransomware/Gambling Pressure Score: ${gamblingScore}/100 (${gamblingInfections} active infections tracked)
- ${horizon}-Day Forecast: avg ${avgForecast}/100, ending at ${endForecast}/100, trend ${trend >= 0 ? '+' : ''}${trend} points

YOUR TASK — generate a concise ${horizon}-day forecast analysis with:
1. Executive summary (1-2 sentences): current risk posture and trajectory
2. Key drivers: top 2-3 factors pushing the index up or down
3. Sector spotlight: which sector is most at risk in the forecast window
4. Recommended actions: 2-3 concrete mitigations
5. Confidence level: based on data quality and volatility

FORMAT:
- English
- Use ⚠️ 🔴 🟡 🟢 emoji sparingly
- Markdown bold for key numbers
- Keep it under 300 words
- End with: "⚠️ This is model-generated analysis. Verify with real-time data before making security decisions."`;

    const response = await fetch(`${FIREWORKS_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FIREWORKS_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'accounts/fireworks/models/deepseek-v4-pro',
        max_tokens: 800,
        temperature: 0.3,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate ${horizon}-day cyber inflation forecast analysis for Indonesia based on the data provided.` },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Fireworks AI API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Forecast AI unavailable', details: errorText },
        { status: 502 }
      );
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content?.trim()
      || 'Unable to generate forecast analysis at this time.';

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Forecast analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
