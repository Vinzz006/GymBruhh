from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class AIConversation(Base):
    __tablename__ = "ai_conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(150), default="Fitness Consultation")
    context_type = Column(String(50), default="general") # general | workout_plan | nutrition | progress_review
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="ai_conversations")
    messages = relationship("AIMessage", back_populates="conversation", cascade="all, delete-orphan", order_by="AIMessage.created_at")

class AIMessage(Base):
    __tablename__ = "ai_messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("ai_conversations.id", ondelete="CASCADE"), nullable=False)
    sender = Column(String(20), nullable=False) # user | assistant | system
    content = Column(Text, nullable=False)
    message_metadata = Column(JSON, nullable=True) # suggestions, actions, charts
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("AIConversation", back_populates="messages")

class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category = Column(String(50), nullable=False) # progressive_overload | nutrition | recovery | exercise_sub | weekly_review
    title = Column(String(150), nullable=False)
    recommendation_text = Column(Text, nullable=False)
    reasoning = Column(Text, nullable=True)
    action_type = Column(String(50), nullable=True) # adjust_weight | adjust_reps | swap_exercise | adjust_calories
    action_data = Column(JSON, nullable=True) # e.g. {"exercise_id": 1, "old_weight": 60, "new_weight": 62.5}
    is_accepted = Column(Boolean, nullable=True) # True = accepted, False = rejected, None = pending
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="ai_recommendations")
