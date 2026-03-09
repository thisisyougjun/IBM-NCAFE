import json
import asyncio
from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse
from app.models.schemas import ChatRequest, Message
from app.services.gemini import agent_chat, agent_chat_stream

router = APIRouter()


def to_gemini_messages(messages: list[Message]) -> list[dict]:
    return [{"role": m.role, "parts": [{"text": m.content}]} for m in messages]


@router.post("/chat")
async def handle_chat(request: ChatRequest):
    gemini_messages = to_gemini_messages(request.messages)

    if not request.stream:
        # 동기 함수를 별도 스레드에서 실행해 이벤트 루프 블로킹 방지
        result = await asyncio.get_event_loop().run_in_executor(
            None, agent_chat, gemini_messages
        )
        return {"content": result}

    async def event_generator():
        # Tool Call 루프를 포함하는 에이전트 스트리밍
        loop = asyncio.get_event_loop()
        chunks = await loop.run_in_executor(
            None, lambda: list(agent_chat_stream(gemini_messages))
        )
        for chunk in chunks:
            yield {"data": json.dumps({"content": chunk})}
        yield {"data": "[DONE]"}

    return EventSourceResponse(event_generator())
