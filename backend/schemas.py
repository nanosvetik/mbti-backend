from pydantic import BaseModel
from typing import List, Optional
from typing import Dict

class UserCreate(BaseModel):
    name: str
    gender: str

class UserResponse(UserCreate):
    id: str
    current_static_step: int
    
    class Config:
        orm_mode = True

class QuestionResponse(BaseModel):
    id: int
    situation: str
    text: str # axis is hidden or maybe needed?
    option_a: str
    key_a: str
    option_b: str
    key_b: str
    
    class Config:
        orm_mode = True

class AnswerCreate(BaseModel):
    user_id: str
    question_id: int
    selected_key: str

class MBTIResult(BaseModel):
    E: int
    I: int
    S: int
    N: int
    T: int
    F: int
    J: int
    P: int
    type: str

# Схемы для чата (Этап 2)
class ChatMessage(BaseModel):
    role: str    # "user" или "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage]

# Схема для отображения одной реплики в истории
class ChatMessageResponse(BaseModel):
    role: str
    content: str

    class Config:
        from_attributes = True

# Схема для вложенных метрик внутри отчета
class AIReportMetrics(BaseModel):
    E_I: int
    S_N: int
    T_F: int
    J_P: int

# Схема для самого отчета
class AIReportResponse(BaseModel):
    mbti_type: str
    metrics: Dict[str, int] # Мы будем преобразовывать колонки e_i, s_n в этот словарь
    skill_gaps: List[str]
    summary: str

    class Config:
        from_attributes = True

# Обновляем схему ответа на чат, чтобы она могла содержать отчет
class ChatResponse(BaseModel):
    text: str
    usage: Dict[str, int]
    cost: float
    report: Optional[AIReportResponse] = None # Отчет появится только в конце    