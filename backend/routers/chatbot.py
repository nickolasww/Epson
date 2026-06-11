from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from schemas.chat import ChatRequest
from database.connection import get_db
from database.models import ChatLog
from services import rag
import uuid

router = APIRouter(prefix="/chat", tags=["chatbot"])


@router.post("")
async def chat(payload: ChatRequest, db: Session = Depends(get_db)):
    result = await rag.generate_answer(payload.message, payload.session_id)

    # Persist chat log
    try:
        log = ChatLog(
            session_id=result["session_id"],
            user_message=payload.message,
            bot_response=result["response"],
        )
        db.add(log)
        db.commit()
    except Exception:
        pass  # Don't fail the request if logging fails

    return {
        "message": "success",
        "data": result,
    }
