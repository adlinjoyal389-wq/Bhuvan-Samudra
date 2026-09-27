import json
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.models import ORCAConversation, UserMemory
from ..schemas.schemas import ORCAQueryRequest, ORCAQueryResponse
from ..agents.orca_orchestrator import ORCAOrchestrator

router = APIRouter(prefix="/orca", tags=["ORCA Assistant"])
orchestrator = ORCAOrchestrator()


@router.post("/query", response_model=ORCAQueryResponse)
def query_orca(req: ORCAQueryRequest, db: Session = Depends(get_db)):
    result = orchestrator.process_query(
        question=req.question,
        language=req.language or "en",
        user_id=req.user_id or 1,
        lat=req.current_lat or 8.0883,
        lon=req.current_lon or 77.5385,
        db=db,
    )

    # Persist in conversation memory
    conv = ORCAConversation(
        user_id=req.user_id or 1,
        language=req.language or "en",
        question=req.question,
        answer=result["answer"],
        evidence=json.dumps(result["evidence"]),
        query_type=result["detected_intent"],
        timestamp=datetime.datetime.utcnow(),
    )
    db.add(conv)

    # Update user memory recent queries
    user_mem = db.query(UserMemory).filter(UserMemory.user_id == (req.user_id or 1)).first()
    if user_mem:
        try:
            queries = json.loads(user_mem.recent_orca_queries or "[]")
            queries.append(req.question)
            if len(queries) > 10:
                queries = queries[-10:]
            user_mem.recent_orca_queries = json.dumps(queries)
        except Exception:
            pass

    db.commit()

    return ORCAQueryResponse(
        question=result["question"],
        answer=result["answer"],
        language=result["language"],
        detected_intent=result["detected_intent"],
        evidence=result["evidence"],
        map_action=result["map_action"],
        data_timestamp=result["data_timestamp"],
        data_source=result["data_source"],
    )


@router.get("/history")
def get_history(user_id: int = Query(default=1), limit: int = 10, db: Session = Depends(get_db)):
    convs = (
        db.query(ORCAConversation)
        .filter(ORCAConversation.user_id == user_id)
        .order_by(ORCAConversation.timestamp.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": c.id,
            "question": c.question,
            "answer": c.answer,
            "language": c.language,
            "query_type": c.query_type,
            "timestamp": c.timestamp.strftime("%I:%M %p"),
        }
        for c in reversed(convs)
    ]
