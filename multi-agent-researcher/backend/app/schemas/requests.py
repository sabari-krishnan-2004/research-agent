from pydantic import BaseModel, Field
from typing import Optional

class ResearchRequest(BaseModel):
    query: str = Field(..., description="The main topic or query to research.")
    thread_id: Optional[str] = Field(None, description="Thread ID to track conversation history.")
