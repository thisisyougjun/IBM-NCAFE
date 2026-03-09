import { NextRequest } from 'next/server';

const AGENT_BASE = process.env.AGENT_BASE_URL || 'http://localhost:8000';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const agentRes = await fetch(`${AGENT_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  // agent-server의 응답(SSE or JSON)을 그대로 클라이언트에 전달
  return new Response(agentRes.body, {
    status: agentRes.status,
    headers: {
      'Content-Type': agentRes.headers.get('Content-Type') || 'text/event-stream',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  });
}
