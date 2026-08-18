import json
import uuid
import datetime
import traceback
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from langchain_core.messages import HumanMessage

from app.graph.workflow import graph
from app.schemas.requests import ResearchRequest

router = APIRouter()

async def stream_research(query: str, thread_id: str):
    inputs = {"messages": [HumanMessage(content=query)]}
    config = {"configurable": {"thread_id": thread_id}}
    
    # Helper to generate formatted JSON logs for the terminal UI
    def make_log(msg: str):
        return json.dumps({
            "event": "log",
            "message": msg,
            "timestamp": datetime.datetime.now().strftime("%H:%M:%S")
        })

    init_msg = f'Initializing research engine pipeline for user query: "{query}"'
    yield f"data: {make_log(init_msg)}\n\n"
    
    try:
        async for event in graph.astream_events(inputs, config, version="v2"):
            kind = event.get("event")
            name = event.get("name")
            tags = event.get("tags", [])
            
            # 1. Node Start Event
            if kind == "on_chain_start" and name in ["supervisor", "researcher", "critic", "synthesizer"]:
                yield f"data: {json.dumps({'event': 'node_start', 'node': name})}\n\n"
                yield f"data: {make_log(f'Agent Node [{name.upper()}] started processing.')}\n\n"
                
            # 2. Node Completion Event
            elif kind == "on_chain_end" and name in ["supervisor", "researcher", "critic", "synthesizer"]:
                output = event.get("data", {}).get("output", {})
                yield f"data: {json.dumps({'event': 'node_end', 'node': name})}\n\n"
                yield f"data: {make_log(f'Agent Node [{name.upper()}] completed.')}\n\n"
                
                # Context-aware node logging
                if name == "supervisor":
                    queries = output.get("research_plan", [])
                    if queries:
                        yield f"data: {make_log(f'Supervisor finalized research plan with sub-queries: {queries}')}\n\n"
                elif name == "researcher":
                    scraped = output.get("scraped_data", [])
                    total_sources = sum(len(item.get("results", [])) for item in scraped)
                    yield f"data: {make_log(f'Researcher scraped {total_sources} web resources across all sub-queries.')}\n\n"
                    for idx, item in enumerate(scraped):
                        q = item.get("query")
                        results_len = len(item.get("results", []))
                        sub_msg = f'Sub-Query [{idx+1}/{len(scraped)}]: "{q}" -> {results_len} results extracted.'
                        yield f"data: {make_log(sub_msg)}\n\n"
                elif name == "critic":
                    approved = output.get("critic_approved", False)
                    loops = output.get("loop_count", 0)
                    status_text = "APPROVED" if approved else "REJECTED (re-routing for details)"
                    yield f"data: {make_log(f'Critic Assessment: {status_text} (Loop {loops}/2)')}\n\n"
                    if not approved:
                        next_queries = output.get("research_plan", [])
                        if next_queries:
                            yield f"data: {make_log(f'Critic injected refined queries: {next_queries}')}\n\n"
                elif name == "synthesizer":
                    final_report = output.get("final_report", "")
                    yield f"data: {json.dumps({'event': 'complete', 'final_report': final_report})}\n\n"
                    yield f"data: {make_log('Synthesis completed. Generated final research report.')}\n\n"
            
            # 3. Synthesizer Raw Token Streaming
            elif kind == "on_chat_model_stream" and "synthesizer_llm" in tags:
                chunk = event.get("data", {}).get("chunk")
                if chunk and chunk.content:
                    yield f"data: {json.dumps({'event': 'token', 'text': chunk.content})}\n\n"
                    
    except Exception as e:
        err_msg = f"Error in LangGraph workflow: {str(e)}"
        traceback.print_exc()
        yield f"data: {json.dumps({'event': 'error', 'message': err_msg})}\n\n"
        yield f"data: {make_log(f'CRITICAL EXCEPTION: {err_msg}')}\n\n"

@router.post("/research")
async def start_research(request: ResearchRequest):
    thread_id = request.thread_id or str(uuid.uuid4())
    return StreamingResponse(
        stream_research(request.query, thread_id),
        media_type="text/event-stream"
    )
