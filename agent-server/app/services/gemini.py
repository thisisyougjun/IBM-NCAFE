"""
NCafe AI 바리스타 에이전트 서비스

Gemini Function Calling(Tool Use)을 사용해 실제 메뉴 데이터를 조회하고
카페 전문 상담을 제공하는 AI 에이전트입니다.
"""

import json
import httpx
from typing import Generator
from google import genai
from google.genai import types
from app.config import GEMINI_API_KEY, BACKEND_BASE_URL
from app.services.rag_service import rag_service

client = genai.Client(api_key=GEMINI_API_KEY)
MODEL = "gemini-2.5-flash"

# ── 시스템 프롬프트 ──────────────────────────────────────────────────────────
SYSTEM_INSTRUCTION = """당신은 NCafe(엔카페)의 AI 바리스타 어시스턴트입니다.

## 역할
- 고객이 메뉴를 선택할 수 있도록 친절하게 안내합니다.
- 메뉴 추천, 음료 특징, 가격 안내 등 카페 관련 모든 질문에 답변합니다.
- 고객의 취향(달달한 것 선호, 카페인 기피 등)에 맞는 메뉴를 추천합니다.

## 도구 사용 규칙
- 메뉴, 가격, 재고, 추천 관련 질문에는 반드시 제공된 도구를 먼저 호출해 최신 정보를 확인하세요.
- 매장 영업시간, 이용 수칙, 할인(텀블러 할인 등), 애견 동반, 환불 규정 등 카페 운영과 관련된 질문을 받으면 반드시 'search_documents' 도구를 사용하여 관련 지식을 먼저 검색하세요.
- 도구 결과를 바탕으로 정확한 정보를 제공하세요. 없는 정보나 메뉴를 지어내지 마세요.

## 응답 스타일
- 친절하고 따뜻한 바리스타 톤으로 답변합니다.
- 한국어로 답변합니다.
- 이모지를 적절히 활용해 친근감을 더합니다.
- 메뉴를 소개할 때 가격과 특징을 함께 안내합니다.
"""

# ── Tool 정의 ────────────────────────────────────────────────────────────────
menu_tools = types.Tool(
    function_declarations=[
        types.FunctionDeclaration(
            name="get_menu_list",
            description="카페의 전체 메뉴 목록을 조회합니다. 카테고리나 검색어로 필터링할 수 있습니다. 메뉴 추천, 메뉴 목록 안내, 가격 문의 시 사용하세요.",
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "category_id": types.Schema(
                        type=types.Type.INTEGER,
                        description="카테고리 ID로 필터링 (선택사항). 예: 1=커피, 2=논커피, 3=디저트",
                    ),
                    "search_query": types.Schema(
                        type=types.Type.STRING,
                        description="메뉴 이름 또는 설명으로 검색 (선택사항). 예: '아메리카노', '달콤한'",
                    ),
                },
                required=[],
            ),
        ),
        types.FunctionDeclaration(
            name="get_menu_detail",
            description="특정 메뉴의 상세 정보를 조회합니다. 메뉴 ID가 필요합니다. 특정 메뉴의 상세 정보, 옵션, 재고 여부를 확인할 때 사용하세요.",
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "menu_id": types.Schema(
                        type=types.Type.INTEGER,
                        description="조회할 메뉴의 ID",
                    ),
                },
                required=["menu_id"],
            ),
        ),
        types.FunctionDeclaration(
            name="search_documents",
            description="카페 매뉴얼, 이용 시간, 와이파이, 주차, 애견 동반, 이벤트, 쿠폰, 알레르기, 환불 처리 등 카페 매장 운영/이용과 관련된 지식 문서를 검색합니다. 고객 질문에 매장 규정 등 정보가 필요하면 가장 먼저 사용하세요.",
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "query": types.Schema(
                        type=types.Type.STRING,
                        description="검색할 질문이나 키워드 (예: '애견 동반', '텀블러 할인')",
                    ),
                },
                required=["query"],
            ),
        ),
    ]
)


# ── Tool 실행 함수 ─────────────────────────────────────────────────────────────
def _call_get_menu_list(
    category_id: int | None = None, search_query: str | None = None
) -> dict:
    """Spring Boot /menu API를 호출해 메뉴 목록을 반환합니다."""
    params = {}
    if category_id is not None:
        params["categoryId"] = category_id
    if search_query:
        params["searchQuery"] = search_query

    try:
        with httpx.Client(timeout=5.0) as http:
            res = http.get(f"{BACKEND_BASE_URL}/menu", params=params)
            res.raise_for_status()
            data = res.json()
            return data
    except Exception as e:
        return {"error": f"메뉴 목록 조회 실패: {str(e)}", "menus": [], "total": 0}


def _call_get_menu_detail(menu_id: int) -> dict:
    """Spring Boot /menu/{id} API를 호출해 메뉴 상세 정보를 반환합니다."""
    try:
        with httpx.Client(timeout=5.0) as http:
            res = http.get(f"{BACKEND_BASE_URL}/menu/{menu_id}")
            res.raise_for_status()
            return res.json()
    except Exception as e:
        return {"error": f"메뉴 상세 조회 실패: {str(e)}"}


def _dispatch_tool_call(tool_name: str, tool_args: dict) -> str:
    """Tool 이름에 따라 적절한 함수를 호출하고 JSON 문자열로 반환합니다."""
    if tool_name == "get_menu_list":
        result = _call_get_menu_list(
            category_id=tool_args.get("category_id"),
            search_query=tool_args.get("search_query"),
        )
    elif tool_name == "get_menu_detail":
        result = _call_get_menu_detail(menu_id=tool_args["menu_id"])
    elif tool_name == "search_documents":
        try:
            results = rag_service.search_documents(tool_args["query"], top_k=3)
            # vector(1024) 등 직렬화 불가능한 필드는 제거하고 텍스트만 유지
            cleaned_results = [
                {"title": r.get("title"), "content": r.get("content")} for r in results
            ]
            result = {"results": cleaned_results}
        except Exception as e:
            result = {"error": f"문서 검색 실패: {str(e)}"}
    else:
        result = {"error": f"알 수 없는 도구: {tool_name}"}

    return json.dumps(result, ensure_ascii=False)


# ── 메시지 변환 ───────────────────────────────────────────────────────────────
def _to_genai_contents(messages: list[dict]) -> list[types.Content]:
    """프론트엔드 메시지 형식을 Gemini Content 형식으로 변환합니다."""
    contents = []
    for m in messages:
        role = "user" if m["role"] == "user" else "model"
        contents.append(
            types.Content(role=role, parts=[types.Part(text=m["parts"][0]["text"])])
        )
    return contents


# ── 에이전트 실행 (단건) ──────────────────────────────────────────────────────
def agent_chat(messages: list[dict]) -> str:
    """
    AI 에이전트 단건 응답 (스트리밍 없음)
    Tool Call 루프를 처리하며 최종 텍스트 응답을 반환합니다.
    """
    contents = _to_genai_contents(messages)

    config = types.GenerateContentConfig(
        system_instruction=SYSTEM_INSTRUCTION,
        tools=[menu_tools],
        temperature=0.7,
    )

    # Tool Call 루프 (최대 5회)
    for _ in range(5):
        response = client.models.generate_content(
            model=MODEL,
            contents=contents,
            config=config,
        )

        candidate = response.candidates[0]

        # 함수 호출이 없으면 최종 텍스트 반환
        has_function_call = any(
            part.function_call is not None for part in candidate.content.parts
        )
        if not has_function_call:
            return response.text or ""

        # Tool 호출 처리
        contents.append(candidate.content)

        tool_response_parts = []
        for part in candidate.content.parts:
            if part.function_call:
                fc = part.function_call
                result_str = _dispatch_tool_call(fc.name, dict(fc.args))
                tool_response_parts.append(
                    types.Part(
                        function_response=types.FunctionResponse(
                            name=fc.name,
                            response={"result": result_str},
                        )
                    )
                )

        contents.append(types.Content(role="user", parts=tool_response_parts))

    return "죄송합니다. 요청을 처리하는 도중 문제가 발생했습니다."


# ── 에이전트 실행 (스트리밍) ──────────────────────────────────────────────────
def agent_chat_stream(messages: list[dict]) -> Generator[str, None, None]:
    """
    AI 에이전트 스트리밍 응답
    Tool 호출이 필요하면 먼저 처리 후, 최종 응답을 스트리밍합니다.
    """
    contents = _to_genai_contents(messages)

    config = types.GenerateContentConfig(
        system_instruction=SYSTEM_INSTRUCTION,
        tools=[menu_tools],
        temperature=0.7,
    )

    # Tool Call 루프 (최대 5회) - 마지막 응답만 스트리밍
    for step in range(5):
        # 마지막 최종 응답은 스트리밍으로
        response = client.models.generate_content(
            model=MODEL,
            contents=contents,
            config=config,
        )

        candidate = response.candidates[0]

        has_function_call = any(
            part.function_call is not None for part in candidate.content.parts
        )

        if not has_function_call:
            # 최종 텍스트 응답 - 스트리밍처럼 단어 단위로 yield
            text = response.text or ""
            # 실제 스트리밍을 위해 generate_content_stream 사용
            for chunk in client.models.generate_content_stream(
                model=MODEL,
                contents=contents,
                config=config,
            ):
                if chunk.text:
                    yield chunk.text
            return

        # Tool 호출 처리 (비스트리밍)
        contents.append(candidate.content)

        tool_response_parts = []
        for part in candidate.content.parts:
            if part.function_call:
                fc = part.function_call
                result_str = _dispatch_tool_call(fc.name, dict(fc.args))
                tool_response_parts.append(
                    types.Part(
                        function_response=types.FunctionResponse(
                            name=fc.name,
                            response={"result": result_str},
                        )
                    )
                )

        contents.append(types.Content(role="user", parts=tool_response_parts))

    yield "죄송합니다. 요청을 처리하는 도중 문제가 발생했습니다."
