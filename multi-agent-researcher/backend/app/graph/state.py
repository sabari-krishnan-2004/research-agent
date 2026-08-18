import operator
from typing import Annotated, List, TypedDict, Dict, Any
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

class ResearchState(TypedDict):
    messages: Annotated[List[BaseMessage], add_messages]
    research_plan: List[str]
    scraped_data: Annotated[List[Dict[str, Any]], operator.add]
    critic_approved: bool
    final_report: str
    loop_count: int
