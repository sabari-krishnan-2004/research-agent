import asyncio
from typing import Dict, Any, List
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from tavily import AsyncTavilyClient, TavilyClient

from app.core.config import settings
from app.graph.state import ResearchState

# Structured output schemas
class ResearchPlan(BaseModel):
    queries: List[str] = Field(
        description="List of 2 to 3 specific, search-optimized queries to research different facets of the user request."
    )

class ResearchEvaluation(BaseModel):
    critique: str = Field(
        description="Analysis of whether the accumulated scraped data satisfies the user query and research plan."
    )
    approved: bool = Field(
        description="True if the scraped data is comprehensive and ready for synthesis. False if we need more searches."
    )
    additional_queries: List[str] = Field(
        default_factory=list,
        description="1-2 new or refined queries if not approved. Should be empty if approved."
    )

# Helper function for parallel searches with Tavily
async def search_tavily(query: str) -> List[Dict[str, Any]]:
    if not settings.TAVILY_API_KEY:
        # Fallback if no Tavily API Key provided (mock data for debugging)
        return [{
            "title": f"Mock info for: {query}",
            "url": "https://example.com/mock-search",
            "content": f"This is placeholder content for the search query '{query}'. Please configure TAVILY_API_KEY for real results."
        }]
    
    try:
        client = AsyncTavilyClient(api_key=settings.TAVILY_API_KEY)
        response = await client.search(query, max_results=2)
        return response.get("results", [])
    except Exception:
        try:
            # Fallback to sync client in executor
            client = TavilyClient(api_key=settings.TAVILY_API_KEY)
            response = await asyncio.to_thread(client.search, query, max_results=2)
            return response.get("results", [])
        except Exception as e:
            return [{
                "title": "Search Error",
                "url": "https://error.com",
                "content": f"Failed to execute Tavily search: {str(e)}"
            }]

# Nodes
async def supervisor_node(state: ResearchState) -> Dict[str, Any]:
    """
    Supervisor Node: Deconstructs the main query into 2-3 focused sub-queries.
    """
    user_query = ""
    for msg in reversed(state.get("messages", [])):
        if isinstance(msg, HumanMessage) or (hasattr(msg, "type") and msg.type == "human"):
            user_query = msg.content
            break
    
    if not user_query:
        user_query = "Latest tech trends"

    llm = ChatOpenAI(
        model=settings.SMALL_MODEL_NAME or "gpt-4o-mini",
        temperature=0,
        api_key=settings.OPENAI_API_KEY if settings.OPENAI_API_KEY else None,
        base_url=settings.OPENAI_API_BASE if settings.OPENAI_API_BASE else None
    ).with_structured_output(ResearchPlan)
    
    system_prompt = (
        "You are an expert Research Supervisor. Deconstruct the user's research request into "
        "2 to 3 distinct, high-impact sub-queries designed to extract comprehensive, factual "
        "information from a web search engine. Make the sub-queries specific, optimized for search, "
        "and covering different dimensions of the topic."
    )
    
    plan: ResearchPlan = await llm.ainvoke([
        SystemMessage(content=system_prompt),
        HumanMessage(content=f"Deconstruct this query: {user_query}")
    ])
    
    return {
        "research_plan": plan.queries,
        "loop_count": 0,
        "critic_approved": False
    }

async def researcher_node(state: ResearchState) -> Dict[str, Any]:
    """
    Researcher Node: Queries Tavily in parallel for the queries listed in research_plan.
    """
    queries = state.get("research_plan", [])
    if not queries:
        return {"scraped_data": []}
    
    # Run Tavily searches in parallel
    search_tasks = [search_tavily(q) for q in queries]
    search_results = await asyncio.gather(*search_tasks)
    
    accumulated = []
    for q, results in zip(queries, search_results):
        formatted_results = []
        for r in results:
            formatted_results.append({
                "title": r.get("title", "Untitled Page"),
                "url": r.get("url", "#"),
                "content": r.get("content", "")
            })
        accumulated.append({
            "query": q,
            "results": formatted_results
        })
        
    return {"scraped_data": accumulated}

async def critic_node(state: ResearchState) -> Dict[str, Any]:
    """
    Critic Node: Evaluates if scraped_data is comprehensive enough.
    """
    user_query = ""
    for msg in reversed(state.get("messages", [])):
        if isinstance(msg, HumanMessage) or (hasattr(msg, "type") and msg.type == "human"):
            user_query = msg.content
            break
            
    plan = state.get("research_plan", [])
    scraped = state.get("scraped_data", [])
    loop_count = state.get("loop_count", 0)
    
    # Format scraped data context for evaluation
    data_context = ""
    for idx, item in enumerate(scraped):
        data_context += f"\nQuery: {item.get('query')}\n"
        for r in item.get("results", []):
            data_context += f"- Title: {r['title']}\n  URL: {r['url']}\n  Content: {r['content']}\n"
            
    llm = ChatOpenAI(
        model=settings.SMALL_MODEL_NAME or "gpt-4o-mini",
        temperature=0,
        api_key=settings.OPENAI_API_KEY if settings.OPENAI_API_KEY else None,
        base_url=settings.OPENAI_API_BASE if settings.OPENAI_API_BASE else None
    ).with_structured_output(ResearchEvaluation)
    
    system_prompt = (
        "You are a rigorous Fact-Checker & Research Critic. Review the user's primary query, "
        "the current research sub-queries plan, and the scraped search results. "
        "Evaluate if the scraped results contain sufficient factual detail to synthesize a highly detailed, "
        "comprehensive markdown report answering the user's query.\n"
        "If some sub-topics lack detail or are missing, mark approved=False and specify 1-2 new, "
        "refined sub-queries to retrieve the missing information. If the results are already highly "
        "comprehensive, mark approved=True and leave additional_queries empty."
    )
    
    evaluation: ResearchEvaluation = await llm.ainvoke([
        SystemMessage(content=system_prompt),
        HumanMessage(content=f"Primary Query: {user_query}\nResearch Plan: {plan}\n\nScraped Data:\n{data_context}")
    ])
    
    next_queries = evaluation.additional_queries if not evaluation.approved and loop_count < 2 else []
    
    return {
        "critic_approved": evaluation.approved,
        "research_plan": next_queries,
        "loop_count": loop_count + 1
    }

async def synthesizer_node(state: ResearchState) -> Dict[str, Any]:
    """
    Synthesizer Node: Renders the final executive report in markdown.
    Streams output tokens by consuming model.astream to generate on_chat_model_stream events.
    """
    user_query = ""
    for msg in reversed(state.get("messages", [])):
        if isinstance(msg, HumanMessage) or (hasattr(msg, "type") and msg.type == "human"):
            user_query = msg.content
            break
            
    scraped = state.get("scraped_data", [])
    
    # Format all scraped context
    context_str = ""
    for idx, item in enumerate(scraped):
        context_str += f"\n### Research Results for Sub-Topic: {item.get('query')}\n"
        for r in item.get("results", []):
            context_str += f"Source: [{r['title']}]({r['url']})\nSnippet: {r['content']}\n\n"
            
    system_prompt = (
        "You are an Elite Research Synthesizer. Your goal is to write a highly detailed, executive-level, "
        "and structured report based on the provided search results.\n\n"
        "Strict Formatting Requirements:\n"
        "1. Write exclusively in clean Markdown.\n"
        "2. Provide an 'Executive Summary' with high-level insights.\n"
        "3. Provide a 'Key Findings' section details the core points.\n"
        "4. Provide a 'Comparative Breakdown' utilizing markdown tables to compare findings/metrics.\n"
        "5. Provide a 'Sources & Citations' section listing all unique references used in the text. "
        "Use working markdown links pointing to the URLs. Ensure every fact is cited with a markdown inline link (e.g., [1](URL)).\n"
        "6. Do not include placeholders or generic text; make the report detailed, objective, and dense with facts."
    )
    
    user_prompt = f"User Request: {user_query}\n\nScraped Context:\n{context_str}\n\nPlease write the comprehensive report."
    
    # We tag this specific ChatOpenAI run with "synthesizer_llm" so we can extract it in routes.py
    llm = ChatOpenAI(
        model=settings.MODEL_NAME or "gpt-4o",
        temperature=0.2,
        streaming=True,
        tags=["synthesizer_llm"],
        api_key=settings.OPENAI_API_KEY if settings.OPENAI_API_KEY else None,
        base_url=settings.OPENAI_API_BASE if settings.OPENAI_API_BASE else None
    )
    
    # Stream the output chunks and assemble them so they can be written to the final state
    full_report = ""
    async for chunk in llm.astream([
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_prompt)
    ]):
        full_report += chunk.content
        
    return {"final_report": full_report}
