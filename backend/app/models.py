from pydantic import BaseModel
from typing import Optional

class EmailRequest(BaseModel):
    recipient: str
    subject: str
    body: str
    predefined_message: Optional[str] = None