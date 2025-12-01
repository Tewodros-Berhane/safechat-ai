from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, conlist


class ModerateRequest(BaseModel):
    text: str = Field(..., description="Message content to moderate")
    user_id: Any = Field(..., description="User ID from chat service")
    chat_id: Any = Field(..., description="Chat ID from chat service")
    message_id: Any = Field(None, description="Optional message ID from chat service")


class ModerateResponse(BaseModel):
    label: str
    score: float
    action: str
    sanitized_text: str
    moderator_reason: Optional[str] = None


class BatchModerateItem(BaseModel):
    text: str
    user_id: Any
    chat_id: Any
    message_id: Any = None


class BatchModerateRequest(BaseModel):
    items: conlist(BatchModerateItem, min_items=1, max_items=200)


class BatchModerateResponse(BaseModel):
    results: List[ModerateResponse]


class ModerationEvent(BaseModel):
    event: str
    action: str
    label: str
    score: float
    sanitized_text: Optional[str] = None
    user_id: Optional[Any] = None
    chat_id: Optional[Any] = None
    reason: Optional[str] = None
    message_id: Optional[Any] = None
    metadata: Optional[Dict[str, Any]] = None
