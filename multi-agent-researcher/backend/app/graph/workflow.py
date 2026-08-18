from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

from app.graph.state import ResearchState
from app.graph.nodes import (
    supervisor_node,
    researcher_node,
    critic_node,
    synthesizer_node
)

def build_workflow():
    # Initialize the state graph
    workflow = StateGraph(ResearchState)
    
    # Add nodes
    workflow.add_node("supervisor", supervisor_node)
    workflow.add_node("researcher", researcher_node)
    workflow.add_node("critic", critic_node)
    workflow.add_node("synthesizer", synthesizer_node)
    
    # Set entry point
    workflow.set_entry_point("supervisor")
    
    # Set edges
    workflow.add_edge("supervisor", "researcher")
    workflow.add_edge("researcher", "critic")
    
    # Define conditional routing from critic
    def route_critic(state: ResearchState):
        is_approved = state.get("critic_approved", False)
        loops = state.get("loop_count", 0)
        
        # Limit loops to 2 to prevent infinite cycles
        if is_approved or loops >= 2:
            return "synthesizer"
        
        # Route back to researcher for additional research queries
        return "researcher"
        
    workflow.add_conditional_edges(
        "critic",
        route_critic,
        {
            "synthesizer": "synthesizer",
            "researcher": "researcher"
        }
    )
    
    workflow.add_edge("synthesizer", END)
    
    # Preserve state using MemorySaver checkpointer
    checkpointer = MemorySaver()
    return workflow.compile(checkpointer=checkpointer)

# Global graph instance
graph = build_workflow()
