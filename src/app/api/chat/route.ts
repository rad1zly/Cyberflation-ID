import { NextRequest, NextResponse } from 'next/server';

const FIREWORKS_API_KEY = process.env.FIREWORKS_API_KEY || '';
const FIREWORKS_BASE_URL = process.env.FIREWORKS_BASE_URL || 'https://api.fireworks.ai/inference/v1';

const SYSTEM_PROMPT = `You are the AI Analyst for Cyberflation.ID platform — early warning system for cyber risk pressure in Indonesia.

YOU MUST ONLY ANSWER QUESTIONS RELATED TO:
- Cyber inflation / cyber risk pressure in Indonesia
- Cybersecurity incidents (defacement, breach, phishing, ransomware, etc.)
- Monitored sectors: Government, Education, Health, Finance, Corporate, Public
- Cyber Inflation Index and forecast
- Incident reports and early warning
- Cyberflation.ID platform in general

IF ASKED OUT OF SCOPE, DECLINE POLITELY:
"Sorry, I can only answer questions related to Cyberflation.ID and Indonesia cyber risk landscape. For other topics, please contact the appropriate channel."

DATA REFERENCE (as of July 2026):
- Cyber Inflation Index Indonesia: 71/100 (HIGH)
- Total incidents tracked: 1,247
- Government: 82/100 (CRITICAL), +23% weekly
- Health: 76/100 (HIGH), +18% weekly  
- Education: 68/100 (HIGH), +31% weekly
- Corporate: 59/100 (MEDIUM), +7% weekly
- Public: 54/100 (MEDIUM), -5% weekly
- Finance: 38/100 (LOW), +2% weekly
- Active threats: 23
- Top threats: defacement .go.id, education credential leaks, LockBit 4.0 ransomware

RESPONSE FORMAT:
- English (required)
- Relevant emoji
- Markdown table for data
- Confidence score at end
- Actionable recommendation
- Disclaimer if data is uncertain`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const conversationMessages = messages
      .slice(-10)
      .map((m: { role: string; content: string }) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

    const response = await fetch(`${FIREWORKS_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FIREWORKS_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'accounts/fireworks/models/deepseek-v4-pro',
        max_tokens: 1024,
        temperature: 0.3,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...conversationMessages,
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MiniMax API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'AI service unavailable', details: errorText },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim()
      || 'No response from AI.';

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
