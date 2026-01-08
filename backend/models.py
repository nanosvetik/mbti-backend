import uuid
from sqlalchemy import Column, String, Integer, ForeignKey, Text, JSON, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, index=True)
    gender = Column(String)
    current_static_step = Column(Integer, default=0)

    # Связи
    answers = relationship("UserAnswer", back_populates="user")
    # Добавляем связь с историей чата
    chat_messages = relationship("ChatMessage", back_populates="user")
    # Добавляем связь с финальным отчетом (uselist=False делает связь 1-к-1)
    ai_report = relationship("AIReport", back_populates="user", uselist=False)

class StaticQuestion(Base):
    __tablename__ = "static_questions"

    id = Column(Integer, primary_key=True, index=True)
    situation = Column(String)
    text = Column(String)
    option_a = Column(String)
    key_a = Column(String)
    option_b = Column(String)
    key_b = Column(String)
    axis = Column(String) 

    answers = relationship("UserAnswer", back_populates="question")

class UserAnswer(Base):
    __tablename__ = "user_answers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    question_id = Column(Integer, ForeignKey("static_questions.id"))
    selected_key = Column(String) 

    user = relationship("User", back_populates="answers")
    question = relationship("StaticQuestion", back_populates="answers")

# --- НОВЫЕ ТАБЛИЦЫ ---

class ChatMessage(Base):
    """Таблица для хранения истории диалога (защита от обрывов связи)"""
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    role = Column(String)  # "user" или "assistant"
    content = Column(Text)
    timestamp = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="chat_messages")

class AIReport(Base):
    """Таблица для финального психологического профиля и рекомендаций"""
    __tablename__ = "ai_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), unique=True)
    
    mbti_type = Column(String)
    # Метрики (0-100)
    e_i = Column(Integer)
    s_n = Column(Integer)
    t_f = Column(Integer)
    j_p = Column(Integer)
    
    skill_gaps = Column(JSON)  # Список рекомендаций по обучению
    summary = Column(Text)     # Общий вывод Акмеолога

    user = relationship("User", back_populates="ai_report")