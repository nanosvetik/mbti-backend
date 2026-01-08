import json
from sqlalchemy.orm import Session
from .database import SessionLocal, engine, Base
from .models import StaticQuestion

def seed_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if db.query(StaticQuestion).first():
        print("Database already seeded")
        return

    with open("backend/questions.json", "r", encoding="utf-8") as f:
        data = json.load(f)
        
        for group in data:
            situation = group["situation"]
            for q in group["questions"]:
                question = StaticQuestion(
                    situation=situation,
                    text=q["q"],
                    option_a=q["a"],
                    key_a=q["ka"],
                    option_b=q["b"],
                    key_b=q["kb"],
                    axis=q["axis"]
                )
                db.add(question)
        
        db.commit()
        print("Database seeded successfully!")

if __name__ == "__main__":
    seed_db()
